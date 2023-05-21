const apiBase = "https://pipedrive-app-backend.onrender.com";

export const getUser = (userId: string) => {
  return fetch(`${apiBase}/user?user_id=${userId}`)
    .then((res) => {
      return res.json();
    })
    .then((res) => res.user)
    .catch((err) => console.log(err));
};

export const getNewToken = async (userId: string) => {
  return fetch(`${apiBase}/refresh_token?user_id=${userId}`).catch((err) => console.log(err));
};

export const getJobFieldsKeys = async (userId: string) => {
  const detailFields = await fetch(`${apiBase}/deal_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.dealFields.data);
  const personFields = await fetch(`${apiBase}/person_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.personFields.data);

  return [...detailFields, ...personFields];
};

export const getJobFieldsValues = async (userId: string, dealId: string) => {
  const detailFields = await fetch(`${apiBase}/get_deal_detail?user_id=${userId}&dealId=${dealId}`)
    .then((res) => res.json())
    .then((res) => res.res.data);
  const personFields = await fetch(
    `${apiBase}/get_person_detail?user_id=${userId}&dealId=${dealId}`
  )
    .then((res) => res.json())
    .then((res) => res.res.data);

  return { ...detailFields, ...personFields };
};

const personFields = ["First name", "Last name", "Phone", "Email"];

export const updateJobFields = async (
  userId: string,
  dealId: string,
  availableFields: { name: string; key: string }[],
  formData: [string, string][]
) => {
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
    .then(() => {
      if (formData.length > 1) {
        updateJobFields(userId, dealId, availableFields, formData.slice(1));
      }
    })
    .catch((err) => console.log(err));
};

const findFieldValue = (
  fieldName: string,
  fieldsKeys: { name: string; key: string }[],
  fieldsValues
) => {
  const fieldKey = fieldsKeys.find((item) => item.name === fieldName);
  if (fieldName === "Email" || fieldName === "Phone") return fieldsValues[fieldKey.key][0].value;
  return fieldKey ? fieldsValues[fieldKey.key] : "";
};

export const getFormDefaultValues = (
  fieldsKeys: { name: string; key: string }[],
  fieldsValues: { [key: string]: string }
) => {
  const fullAddress = findFieldValue("Address", fieldsKeys, fieldsValues).split(",");
  const zipCode = fullAddress[fullAddress.length - 2].split(" ").filter((item) => item !== "")[1];
  const state = fullAddress[fullAddress.length - 2].split(" ").filter((item) => item !== "")[0];
  const city = fullAddress[fullAddress.length - 3]
    .split(" ")
    .filter((item) => item !== "")
    .join("");
  const address = fullAddress.slice(0, fullAddress.length - 3).join(",");
  const area = findFieldValue("Area", fieldsKeys, fieldsValues);

  return {
    "First name": findFieldValue("First name", fieldsKeys, fieldsValues),
    "Last name": findFieldValue("Last name", fieldsKeys, fieldsValues),
    Phone: findFieldValue("Phone", fieldsKeys, fieldsValues),
    Email: findFieldValue("Email", fieldsKeys, fieldsValues),
    "Job type": findFieldValue("Job type", fieldsKeys, fieldsValues),
    "Job source": findFieldValue("Job source", fieldsKeys, fieldsValues),
    "Job description": findFieldValue("Job description", fieldsKeys, fieldsValues),
    "Job date": findFieldValue("Job date", fieldsKeys, fieldsValues),
    "Job start time": findFieldValue("Job start time", fieldsKeys, fieldsValues),
    "Job end time": findFieldValue("Job end time", fieldsKeys, fieldsValues),
    "Test select": findFieldValue(`${area} Technician`, fieldsKeys, fieldsValues),
    Address: address,
    City: city,
    State: state,
    "Zip code": zipCode,
    Area: area,
  };
};

export const createNote = (userId: string, dealId: string, content: string) => {
  return fetch(`${apiBase}/create_note?user_id=${userId}&dealId=${dealId}&content=${content}`)
    .then((res) => {
      return res.json();
    })
    .catch((err) => console.log(err));
};
