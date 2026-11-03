import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const fetchMedications = (search = '') =>
  api.get('/medications', {
    params: { search },
  })

export const addMedication = (medication) =>
  api.post('/medications', medication)

export const updateMedication = (id, medication) =>
  api.put(`/medications/${id}`, medication)

export const deleteMedication = (id) =>
  api.delete(`/medications/${id}`)
