const apiBase = "https://pipedrive-app-backend.onrender.com";

export const getNewToken = async (userId: string) => {
  return fetch(`${apiBase}/refresh_token?user_id=${userId}`).catch((err) => console.log(err));
};

export const getFormDefaultValues = async (currentValues) => {
  return {
    "First name": currentValues["First name"] || "",
    "Last name": currentValues["Last name"] || "",
    Phone: currentValues["Phone"] || "",
    Email: currentValues["Email"] || "",
    "Job type": currentValues["Job type"] || "",
    "Job source": currentValues["Job source"] || "",
    "Job description": currentValues["Job description"] || "",
    "Job date": currentValues["Job date"] || "",
    "Job start time": currentValues["Job start time"] || "",
    "Job end time": currentValues["Job end time"] || "",
    "Test select": currentValues["Test select"] || "",
    Address: currentValues["Address"] || "",
    City: currentValues["City"] || "",
    State: currentValues["State"] || "",
    "Zip code": currentValues["Zip code"] || "",
    Area: currentValues["Area"] || "",
  };
};

export const getJobFields = async (userId) => {
  const detailFields = await fetch(`${apiBase}/deal_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.dealFields.data);
  const personFields = await fetch(`${apiBase}/person_fields?user_id=${userId}`)
    .then((res) => res.json())
    .then((res) => res.personFields.data);

  return [...detailFields, ...personFields];
};

const personFields = ["First name", "Last name", "Phone", "Email"];

export const updateJobFields = async (userId, dealId, availableFields, formData) => {
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
};
