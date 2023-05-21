import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
import "./App.css";
import { UserData, IFormInput } from "./interfaces";
import {
  createNote,
  getFormDefaultValues,
  getJobFieldsKeys,
  getJobFieldsValues,
  getNewToken,
  getUser,
  updateJobFields,
} from "./api.ts";

function App() {
  const [requestStatus, setRequestStatus] = useState("");
  const [jobLink, setJobLink] = useState("");

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      await new AppExtensionsSDK().initialize();
    } catch (err) {
      console.log(err);
    }
  };

  const handleRequestChange = (status: string) => {
    setRequestStatus(status);
  };

  const handleLinkChange = (link: string) => {
    setJobLink(link);
  };

  return (
    <>
      {requestStatus === "success" || requestStatus === "failure" ? (
        <SubmitMessage requestStatus={requestStatus} jobLink={jobLink} />
      ) : (
        <Form
          requestStatus={requestStatus}
          handleRequestChange={handleRequestChange}
          handleLinkChange={handleLinkChange}
        />
      )}
    </>
  );
}

export default App;

const Form: React.FC<{
  requestStatus: string;
  handleRequestChange: (status: string) => void;
  handleLinkChange: (link: string) => void;
}> = ({ requestStatus, handleRequestChange, handleLinkChange }) => {
  const [user, setUser] = useState<UserData>({ id: "", dealId: "", domainName: "" });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInput>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
    getUserData(searchParams.userId, searchParams.selectedIds);
    setFormDefaultValues(searchParams.userId, searchParams.selectedIds);
  }, []);

  const getUserData = async (userId: string, dealId: string) => {
    const data = await getUser(userId);
    setUser({ id: userId, dealId: dealId, domainName: data.company_domain });
  };

  const setFormDefaultValues = async (userId: string, dealId: string) => {
    try {
      await getNewToken(userId);
      const jobFieldsKeys: { name: string; key: string }[] = await getJobFieldsKeys(userId);
      const jobFieldsValues: { [key: string]: string } = await getJobFieldsValues(userId, dealId);
      const defaultValues = getFormDefaultValues(jobFieldsKeys, jobFieldsValues);
      reset(defaultValues);
      const link = `https://${user.domainName}.pipedrive.com/deal/${user.dealId}`;
      handleLinkChange(`link`);
      createNote(
        user.id,
        user.dealId,
        `<div><p>Job is created!</p><a href="${link}">View Job</a></div>`
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);
    handleRequestChange("pending");
    try {
      await getNewToken(user.id);
      const availableFields = await getJobFieldsKeys(user.id);

      const formData = { ...data };

      formData.Address += `, ${formData.City}, ${formData.State} ${formData["Zip code"]}, ${formData.Area}`;
      formData[`${formData.Area} Technician`] = formData["Test select"];

      delete formData.City;
      delete formData.State;
      delete formData["Zip code"];
      delete formData["Test select"];

      await updateJobFields(user.id, user.dealId, availableFields, Object.entries(formData));
      setLoading(false);
      handleRequestChange("success");
    } catch (err) {
      console.log(err);
      setLoading(false);
      handleRequestChange("failure");
    }
  };

  const submitButtonText = requestStatus === "pending" ? "Request is sent..." : "Submit";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {loading ? <p className="text-xl mb-4">Getting current job data...</p> : null}
      <fieldset disabled={loading}>
        <div className="flex gap-8 mb-8">
          <div className="flex flex-col gap-4 max-w-md border p-5 rounded-lg w-full">
            <p className="text-lg text-left">Client Details</p>
            <div className="flex gap-2">
              <div>
                <input placeholder="First Name" {...register("First name", { required: true })} />
                {errors["First name"]?.type === "required" && (
                  <p role="alert">First name is required</p>
                )}
              </div>
              <div>
                <input placeholder="Last Name" {...register("Last name", { required: true })} />
                {errors["Last name"]?.type === "required" && (
                  <p role="alert">Last name is required</p>
                )}
              </div>
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone"
                {...register("Phone", { required: true, pattern: /^[0-9]+$/i })}
              />
              {errors["Phone"]?.type === "required" ? (
                <p role="alert">Phone type is required</p>
              ) : errors["Phone"]?.type === "pattern" ? (
                <p role="alert">Incorrect phone number! Only numbers allowed</p>
              ) : null}
            </div>
            <input type="email" placeholder="Email (Optional)" {...register("Email")} />
          </div>

          <div className="flex flex-col gap-4 max-w-md border p-5 rounded-lg w-full">
            <p className="text-lg text-left">Job Details</p>
            <div className="flex gap-2">
              <div className="w-full">
                <select {...register("Job type", { required: true })}>
                  <option value="">Job Type</option>
                  <option value="Developer">Developer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Janitor">Janitor</option>
                </select>
                {errors["Job type"]?.type === "required" && (
                  <p role="alert">Job type is required</p>
                )}
              </div>
              <div className="w-full">
                <select {...register("Job source", { required: true })}>
                  <option value="">Job Source</option>
                  <option value="Omaha, NE, United States">Omaha, NE, United States</option>
                  <option value="Downey, CA, United States">Downey, CA, United States</option>
                  <option value="Zürich, Switzerland ">Zürich, Switzerland</option>
                </select>
                {errors["Job source"]?.type === "required" && (
                  <p role="alert">Job source is required</p>
                )}
              </div>
            </div>
            <textarea placeholder="Job description (optional)" {...register("Job description")} />
          </div>
        </div>

        <div className="flex gap-8 mb-8">
          <div className="flex flex-col gap-4 max-w-md border p-5 rounded-lg w-full">
            <p className="text-lg text-left">Service location</p>
            <div>
              <input placeholder="Address" {...register("Address", { required: true })} />
              {errors["Address"]?.type === "required" && <p role="alert">Address is required</p>}
            </div>
            <div>
              <input placeholder="City" {...register("City", { required: true })} />
              {errors["City"]?.type === "required" && <p role="alert">City is required</p>}
            </div>
            <div>
              <input placeholder="State" {...register("State", { required: true })} />
              {errors["State"]?.type === "required" && <p role="alert">State is required</p>}
            </div>
            <div className="flex gap-2">
              <div className="w-full">
                <input placeholder="Zip code" {...register("Zip code", { required: true })} />
                {errors["Zip code"]?.type === "required" && (
                  <p role="alert">Zip code is required</p>
                )}
              </div>
              <div className="w-full">
                <input placeholder="Area" {...register("Area", { required: true })} />
                {errors["Area"]?.type === "required" && <p role="alert">Area is required</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 max-w-md border p-5 rounded-lg w-full">
            <p className="text-lg text-left">Scheduled</p>
            <div>
              <input
                type="date"
                placeholder="Start data"
                {...register("Job date", { required: true })}
              />
              {errors["Job date"]?.type === "required" && <p role="alert">Job date is required</p>}
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                defaultValue="08:30"
                placeholder="Start time"
                {...register("Job start time", { required: true })}
              />
              <input
                type="time"
                defaultValue="10:00"
                placeholder="End time"
                {...register("Job end time", { required: true })}
              />
            </div>
            <div>
              <select name="tests" {...register("Test select", { required: true })}>
                <option value="">Test Select</option>
                <option value="Ryan Debris">Ryan Debris</option>
                <option value="Ella Thomson">Ella Thomson</option>
                <option value="Tom Holland">Tom Holland</option>
              </select>
              {errors["Test select"]?.type === "required" && (
                <p role="alert">Test select is required</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-16 justify-center">
          <button
            type="submit"
            className={`${
              requestStatus === "pending" ? "bg-slate-300 text-slate-500" : "bg-lime-600"
            }`}
          >
            {submitButtonText}
          </button>
        </div>
      </fieldset>
    </form>
  );
};

const SubmitMessage: React.FC<{
  requestStatus: string;
  jobLink: string;
}> = ({ requestStatus, jobLink }) => {
  return (
    <div className="flex gap-4 items-center p-4 ">
      <div className="flex gap-2 text-2xl">
        {requestStatus === "success" ? (
          <>
            <p>Job is created!</p>
            <a href={jobLink}>View Job</a>
          </>
        ) : (
          <p>Request failed. Job wasn't created</p>
        )}
      </div>
    </div>
  );
};
