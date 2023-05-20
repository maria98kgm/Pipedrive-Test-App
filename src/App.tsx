import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
import "./App.css";

interface UserData {
  id: string;
  dealId: string;
}

interface IFormInput {
  "Job type": string;
  "Job source": string;
  "Job description": string;
  "Job date": string;
  "Job start time": string;
  "Job end time": string;
  "Test select": string;
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
    // new AppExtensionsSDK().initialize();
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
    setUser({ id: searchParams.user_id, dealId: searchParams.selectedIds });
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await getNewToken(user.id);
    const availableFields = await getJobFields(user.id);

    updateJobFields(user.id, availableFields, Object.entries(data));
  };

  async function updateJobFields(userId, availableFields, formData) {
    const formField = formData[0];
    let jobField = availableFields.find((item) => item.name === formField[0]);

    if (!jobField) {
      await fetch(
        `${apiBase}/create_deal_field?user_id=${userId}&fieldName=${formField[0]}&fieldType=text`
      )
        .then((res) => res.json())
        .then((res) => (jobField = res.data))
        .catch((err) => console.log(err));
    }

    return fetch(
      `${apiBase}/update_deal_field?user_id=${userId}&dealId=${user.dealId}&fieldKey=${jobField.key}&fieldVal=${formField[1]}`
    )
      .then((res) => {
        console.log(res);
        if (formData.length > 1) {
          updateJobFields(userId, availableFields, formData.slice(1));
        }
      })
      .catch((err) => console.log(err));
  }

  const initializeSDK = async () => {
    await new AppExtensionsSDK().initialize();
  };

  const getNewToken = async (userId: string) => {
    return fetch(`${apiBase}/refresh_token?user_id=${userId}`).catch((err) => console.log(err));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}
    >
      {/* <input {...register("Job Type", { required: true, maxLength: 20 })} />
      {errors["Job Type"]?.type === "required" && <p role="alert">First name is required</p>}
      <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
      <input type="number" {...register("age", { min: 18, max: 99 })} />
      <input type="submit" /> */}
      {/* <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Client Details</p>
        <input placeholder="First Name" />
        <input type="text" name="last-name" placeholder="Last Name" />
        <input type="tel" name="phone" placeholder="Phone" />
        <input type="email" name="email" placeholder="Email (Optional)" />
      </div> */}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Job Details</p>
        <select {...register("Job type", { required: true })}>
          <option value="">Job Type</option>
          <option value="developer">Developer</option>
          <option value="accountant">Accountant</option>
          <option value="Janitor">Janitor</option>
        </select>
        {errors["Job type"]?.type === "required" && <p role="alert">Job type is required</p>}
        <select {...register("Job source", { required: true })}>
          <option value="">Job Source</option>
          <option value="developer">Omaha, NE, United States</option>
          <option value="accountant">Downey, CA, United States</option>
          <option value="Janitor">Zürich, Switzerland </option>
        </select>
        {errors["Job source"]?.type === "required" && <p role="alert">Job source is required</p>}
        <textarea placeholder="Job description (optional)" {...register("Job description")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
        <p>Service location</p>
        <input placeholder="Address" />
        <input placeholder="City" />
        <input placeholder="State" />
        <input placeholder="Zip code" />
        <input placeholder="Area" />
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
          <option value="essential">Ryan Debris</option>
          <option value="middle">Ella Thomson</option>
          <option value="hard">Tom Holland</option>
        </select>
        {errors["Test select"]?.type === "required" && <p role="alert">Test select is required</p>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

export default App;

async function getJobFields(userId) {
  return await fetch(`${apiBase}/deal_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.dealFields.data);
}

// import { ChangeEvent, useEffect, useState } from "react";
// import { SubmitHandler, useForm } from "react-hook-form";
// import AppExtensionsSDK from "@pipedrive/app-extensions-sdk";
// import "./App.css";

// interface UserData {
//   userId: string;
// }

// interface IFormInput {
//   "Job type": string;
//   "Job source": string;
//   "Job description": string;
//   "Job date": string;
//   "Job start time": string;
//   "Job end time": string;
//   "Test select": string;
// }

// const apiBase = "https://pipedrive-app-backend.onrender.com";

// // const dealFields = {
// //   Address: "",
// //   "Job type": "",
// //   "Job source": "",
// //   "Job date": "",
// //   "Job start time": "",
// //   "Job end time": "",
// //   "Tampa Technician": "",
// //   "Miami Technician": "",
// //   "Orlando Technician": "",
// //   "Houston Technician": "",
// //   "Charlotte Technician": "",
// //   "Austin Technician": "",
// //   Area: "",
// //   "Job comment": "",
// // };
// // const initialInputData = {};

// function App() {
//   const [user, setUser] = useState<UserData>({ userId: "" });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<IFormInput>();

//   const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);

//   useEffect(() => {
//     initializeSDK();
//     getUserData();
//   }, []);

//   const initializeSDK = async () => {
//     await new AppExtensionsSDK().initialize();
//   };

//   const getUserData = async () => {
//     const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
//     setUser({ userId: searchParams.user_id });
//   };

//   // const postJobData = async () => {
//   //   await getNewToken(user.userId);
//   //   await createJobFields(user.userId, dealFields);
//   //   console.log(await getJobFields(user.userId));
//   // };

//   const getNewToken = async (userId: string) => {
//     return fetch(`${apiBase}/refresh_token?user_id=${userId}`).catch((err) => console.log(err));
//   };

//   // const handleInputChange = (fieldName: string, value: string) => {
//   //   setInputData((prev) => ({ ...prev, [fieldName]: value }));
//   // };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}
//     >
//       {/* <input {...register("Job Type", { required: true, maxLength: 20 })} />
//       {errors["Job Type"]?.type === "required" && <p role="alert">First name is required</p>}
//       <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
//       <input type="number" {...register("age", { min: 18, max: 99 })} />
//       <input type="submit" /> */}
//       {/* <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
//         <p>Client Details</p>
//         <input placeholder="First Name" />
//         <input type="text" name="last-name" placeholder="Last Name" />
//         <input type="tel" name="phone" placeholder="Phone" />
//         <input type="email" name="email" placeholder="Email (Optional)" />
//       </div> */}

//       <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
//         <p>Job Details</p>
//         <select {...register("Job type", { required: true })}>
//           <option value="">Job Type</option>
//           <option value="developer">Developer</option>
//           <option value="accountant">Accountant</option>
//           <option value="Janitor">Janitor</option>
//         </select>
//         {errors["Job type"]?.type === "required" && <p role="alert">Job type is required</p>}
//         <select {...register("Job source", { required: true })}>
//           <option value="">Job Source</option>
//           <option value="developer">Omaha, NE, United States</option>
//           <option value="accountant">Downey, CA, United States</option>
//           <option value="Janitor">Zürich, Switzerland </option>
//         </select>
//         {errors["Job source"]?.type === "required" && <p role="alert">Job source is required</p>}
//         <textarea placeholder="Job description (optional)" {...register("Job description")} />
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
//         <p>Service location</p>
//         <input placeholder="Address" />
//         <input placeholder="City" />
//         <input placeholder="State" />
//         <input placeholder="Zip code" />
//         <input placeholder="Area" />
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: "300px" }}>
//         <p>Scheduled</p>
//         <input type="date" placeholder="Start data" {...register("Job date", { required: true })} />
//         {errors["Job date"]?.type === "required" && <p role="alert">Job date is required</p>}
//         <input
//           type="time"
//           defaultValue="08:30"
//           placeholder="Start time"
//           {...register("Job start time", { required: true })}
//         />
//         <input
//           type="time"
//           defaultValue="10:00"
//           placeholder="End time"
//           {...register("Job end time", { required: true })}
//         />
//         <select name="tests" {...register("Test select", { required: true })}>
//           <option value="">Test Select</option>
//           <option value="essential">Ryan Debris</option>
//           <option value="middle">Ella Thomson</option>
//           <option value="hard">Tom Holland</option>
//         </select>
//         {errors["Test select"]?.type === "required" && <p role="alert">Test select is required</p>}
//       </div>

//       <button type="submit">Submit</button>
//     </form>
//   );
// }

// export default App;

// async function createJobFields(userId, fetchArr) {
//   return await fetch(
//     `${apiBase}/create_deal_field?user_id=${userId}&fieldName=${fetchArr[0].name}&fieldType=${fetchArr[0].type}`
//   ).then(() => {
//     if (fetchArr.slice(1).length) createJobFields(userId, fetchArr.slice(1));
//   });
// }

// async function getJobFields(userId) {
//   return await fetch(`${apiBase}/deal_fields?user_id=${userId}`)
//     .then((res) => res.json())
//     .then((res) => res.dealFields.data);
// }
