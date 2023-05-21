import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
import "./App.css";

interface UserData {
  id: string;
  dealId: string;
}

interface IFormInput {
  "First name": string;
  "Last name": string;
  Phone: string;
  Email: string;
  "Job type": string;
  "Job source": string;
  "Job description": string;
  "Job date": string;
  "Job start time": string;
  "Job end time": string;
  "Test select": string;
  Address: string;
  City: string;
  State: string;
  "Zip code": string;
  Area: string;
}

const apiBase = "https://pipedrive-app-backend.onrender.com";

function App() {
  const [user, setUser] = useState<UserData>({ id: "", dealId: "" });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  useEffect(() => {
    initializeSDK();
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
    setUser({ id: searchParams.user_id, dealId: searchParams.selectedIds });
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await getNewToken(user.id);
    const availableFields = await getJobFields(user.id);

    const formData = { ...data };

    formData.Address += ` ${formData.City}, ${formData.State} ${formData["Zip code"]}, ${formData.Area}`;
    formData[`${formData.Area} Technician`] = formData["Test select"];

    delete formData.City;
    delete formData.State;
    delete formData["Zip code"];
    delete formData.Area;
    delete formData["Test select"];

    updateJobFields(user.id, user.dealId, availableFields, Object.entries(formData));
  };

  const initializeSDK = async () => {
    await new AppExtensionsSDK().initialize();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Client Details</p>
        <div>
          <input placeholder="First Name" {...register("First name", { required: true })} />
          {errors["First name"]?.type === "required" && <p role="alert">First name is required</p>}
        </div>
        <div>
          <input placeholder="Last Name" {...register("Last name", { required: true })} />
          {errors["Last name"]?.type === "required" && <p role="alert">Last name is required</p>}
        </div>
        <div>
          <input
            type="tel"
            placeholder="Phone"
            {...register("Phone", { required: true, pattern: /^\+[0-9]+$/i })}
          />
          {errors["Phone"]?.type === "required" ? (
            <p role="alert">Phone type is required</p>
          ) : errors["Phone"]?.type === "pattern" ? (
            <p role="alert">Incorrect phone number</p>
          ) : null}
        </div>
        <input type="email" placeholder="Email (Optional)" {...register("Email")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Job Details</p>
        <select {...register("Job type", { required: true })}>
          <option value="">Job Type</option>
          <option value="Developer">Developer</option>
          <option value="Accountant">Accountant</option>
          <option value="Janitor">Janitor</option>
        </select>
        {errors["Job type"]?.type === "required" && <p role="alert">Job type is required</p>}
        <select {...register("Job source", { required: true })}>
          <option value="">Job Source</option>
          <option value="Omaha, NE, United States">Omaha, NE, United States</option>
          <option value="Downey, CA, United States">Downey, CA, United States</option>
          <option value="Zürich, Switzerland ">Zürich, Switzerland</option>
        </select>
        {errors["Job source"]?.type === "required" && <p role="alert">Job source is required</p>}
        <textarea placeholder="Job description (optional)" {...register("Job description")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Service location</p>
        <input placeholder="Address" {...register("Address", { required: true })} />
        {errors["Address"]?.type === "required" && <p role="alert">Address is required</p>}
        <input placeholder="City" {...register("City", { required: true })} />
        {errors["City"]?.type === "required" && <p role="alert">City is required</p>}
        <input placeholder="State" {...register("State", { required: true })} />
        {errors["State"]?.type === "required" && <p role="alert">State is required</p>}
        <input placeholder="Zip code" {...register("Zip code", { required: true })} />
        {errors["Zip code"]?.type === "required" && <p role="alert">Zip code is required</p>}
        <input placeholder="Area" {...register("Area", { required: true })} />
        {errors["Area"]?.type === "required" && <p role="alert">Area is required</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Scheduled</p>
        <input type="date" placeholder="Start data" {...register("Job date", { required: true })} />
        {errors["Job date"]?.type === "required" && <p role="alert">Job date is required</p>}
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
        <select name="tests" {...register("Test select", { required: true })}>
          <option value="">Test Select</option>
          <option value="Ryan Debris">Ryan Debris</option>
          <option value="Ella Thomson">Ella Thomson</option>
          <option value="Tom Holland">Tom Holland</option>
        </select>
        {errors["Test select"]?.type === "required" && <p role="alert">Test select is required</p>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

export default App;

const getNewToken = async (userId: string) => {
  return fetch(`${apiBase}/refresh_token?user_id=${userId}`).catch((err) => console.log(err));
};

async function getJobFields(userId) {
  const detailFields = await fetch(`${apiBase}/deal_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.dealFields.data);
  const personFields = await fetch(`${apiBase}/person_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.personFields.data);

  return [...detailFields, ...personFields];
}

const personFields = ["First name", "Last name", "Phone", "Email"];

async function updateJobFields(userId, dealId, availableFields, formData) {
  const formField = formData[0];
  let jobField = availableFields.find((item) => item.name === formField[0]);
  const personEndpoint = jobField ? personFields.includes(jobField.name) : false;

  if (!personEndpoint && !jobField) {
    await fetch(
      `${apiBase}/create_deal_field?user_id=${userId}&fieldName=${formField[0]}&fieldType=text`
    )
      .then((res) => res.json())
      .then((res) => (jobField = res.res.data))
      .catch((err) => console.log(err));
  }

  return fetch(
    `${apiBase}/update_${
      personEndpoint ? "person" : "deal"
    }_field?user_id=${userId}&dealId=${dealId}&fieldKey=${jobField.key}&fieldVal=${formField[1]}`
  )
    .then((res) => {
      if (formData.length > 1) {
        updateJobFields(userId, dealId, availableFields, formData.slice(1));
      }
    })
    .catch((err) => console.log(err));
}
