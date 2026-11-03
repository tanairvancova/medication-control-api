import { useEffect, useState } from 'react'
import {
  fetchMedications,
  addMedication,
  updateMedication,
  deleteMedication as deleteMedicationFromApi,
} from './api'
import './App.css'

const emptyForm = {
  name: '',
  dosage: '',
  frequency: '1 раз в день',
  time: '09:00',
  startDate: '',
  endDate: '',
  description: '',
}

function App() {
  const [medications, setMedications] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [lastSaved, setLastSaved] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Задержка поиска: запрос отправляется через 500 мс после ввода
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  // Загрузка списка с сервера с учётом поискового запроса
  useEffect(() => {
    let isMounted = true

    async function loadMedications() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchMedications(debouncedSearch)

        if (isMounted) {
          setMedications(response.data)
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error.response?.data?.message ||
              'Не удалось загрузить лекарства. Проверьте соединение с сервером.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMedications()

    return () => {
      isMounted = false
    }
  }, [debouncedSearch, refreshKey])

  useEffect(() => {
    document.title = `Мои лекарства (${medications.length})`
  }, [medications.length])

  // Локально оставляем только фильтрацию по времени
  const filteredMedications = medications.filter((medication) => {
    if (filter === 'morning') {
      return medication.time < '12:00'
    }

    if (filter === 'evening') {
      return medication.time >= '12:00'
    }

    return true
  })

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) {
      return
    }

    if (
      !form.name.trim() ||
      !form.dosage.trim() ||
      !form.time ||
      !form.startDate ||
      !form.endDate
    ) {
      setFormError('Заполните все обязательные поля.')
      return
    }

    if (form.startDate > form.endDate) {
      setFormError('Дата начала не может быть позже даты окончания.')
      return
    }

    setFormError('')
    setSaving(true)

    try {
      if (editingId !== null) {
        const id = editingId
        const previousMedications = medications

        const updatedMedication = {
          ...form,
          id,
        }

        // Оптимистически обновляем список до ответа сервера
        setMedications((previous) =>
          previous.map((medication) =>
            medication.id === id
              ? updatedMedication
              : medication,
          ),
        )

        try {
          const response = await updateMedication(id, form)

          // Обновляем элемент ответом сервера
          setMedications((previous) =>
            previous.map((medication) =>
              medication.id === id
                ? response.data
                : medication,
            ),
          )

          setLastSaved(new Date().toLocaleTimeString())
          resetForm()

          // Повторно загружаем список с активным поиском
          setRefreshKey((previous) => previous + 1)
        } catch (error) {
          // Откатываем изменения при ошибке
          setMedications(previousMedications)

          setFormError(
            error.response?.data?.message ||
              'Не удалось изменить лекарство. Изменения отменены.',
          )
        }
      } else {
        const temporaryId = Date.now()

        const temporaryMedication = {
          ...form,
          id: temporaryId,
        }

        // Сразу добавляем лекарство с временным ID
        setMedications((previous) => [
          ...previous,
          temporaryMedication,
        ])

        try {
          const response = await addMedication(form)

          // Заменяем временный элемент данными с сервера
          setMedications((previous) =>
            previous.map((medication) =>
              medication.id === temporaryId
                ? response.data
                : medication,
            ),
          )

          setLastSaved(new Date().toLocaleTimeString())
          resetForm()

          // Повторно загружаем список с активным поиском
          setRefreshKey((previous) => previous + 1)
        } catch (error) {
          // Удаляем временный элемент при ошибке
          setMedications((previous) =>
            previous.filter(
              (medication) => medication.id !== temporaryId,
            ),
          )

          setFormError(
            error.response?.data?.message ||
              'Не удалось добавить лекарство. Попробуйте ещё раз.',
          )
        }
      }
    } finally {
      setSaving(false)
    }
  }

  function startEditing(medication) {
    setForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      time: medication.time,
      startDate: medication.startDate,
      endDate: medication.endDate,
      description: medication.description || '',
    })

    setEditingId(medication.id)
    setFormError('')
    setShowForm(true)
  }

  async function deleteMedication(id) {
    const confirmed = window.confirm(
      'Вы действительно хотите удалить это лекарство?',
    )

    if (!confirmed) {
      return
    }

    const previousMedications = medications

    setDeletingId(id)

    // Оптимистически убираем лекарство из списка
    setMedications((previous) =>
      previous.filter((medication) => medication.id !== id),
    )

    try {
      await deleteMedicationFromApi(id)

      setLastSaved(new Date().toLocaleTimeString())

      if (editingId === id) {
        resetForm()
      }

      // Повторно загружаем список с активным поиском
      setRefreshKey((previous) => previous + 1)
    } catch (error) {
      // Восстанавливаем список при ошибке
      setMedications(previousMedications)

      window.alert(
        error.response?.data?.message ||
          'Не удалось удалить лекарство. Список восстановлен.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setFormError('')
    setShowForm(false)
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader" />
        <p>Загружаем расписание лекарств...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="loading-screen">
        <p>{error}</p>
        <button
          className="primary-button"
          onClick={() => setRefreshKey((previous) => previous + 1)}
        >
          Повторить
        </button>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h1>Мои лекарства</h1>
            <p>Контроль расписания приёма</p>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setForm(emptyForm)
            setEditingId(null)
            setFormError('')
            setShowForm(true)
          }}
        >
          + Добавить лекарство
        </button>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">ВАШЕ ЗДОРОВЬЕ — ВАШ ПРИОРИТЕТ</p>
          <h2>Не забывайте о важном</h2>
          <p>Все лекарства и расписание приёма в одном месте.</p>
        </div>
        <div className="welcome-icon">💊</div>
      </section>

      <section className="statistics">
        <article className="stat-card">
          <span className="stat-icon purple">▤</span>
          <div>
            <p>Всего лекарств</p>
            <strong>{medications.length}</strong>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">◷</span>
          <div>
            <p>Уникальных времён</p>
            <strong>
              {new Set(medications.map((item) => item.time)).size}
            </strong>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">◉</span>
          <div>
            <p>Результатов фильтра</p>
            <strong>{filteredMedications.length}</strong>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="form-card">
          <div className="section-heading">
            <div>
              <h2>
                {editingId !== null
                  ? 'Редактирование лекарства'
                  : 'Новое лекарство'}
              </h2>
              <p>Заполните информацию о препарате</p>
            </div>
            <button
              className="close-button"
              onClick={resetForm}
              disabled={saving}
            >
              ✕
            </button>
          </div>

          {formError && (
            <p className="error-message">{formError}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Название *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Например, Парацетамол"
                  required
                  disabled={saving}
                />
              </label>

              <label>
                Дозировка *
                <input
                  name="dosage"
                  value={form.dosage}
                  onChange={handleChange}
                  placeholder="Например, 500 мг"
                  required
                  disabled={saving}
                />
              </label>

              <label>
                Частота приёма
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option>1 раз в день</option>
                  <option>2 раза в день</option>
                  <option>3 раза в день</option>
                  <option>По назначению врача</option>
                </select>
              </label>

              <label>
                Время приёма *
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </label>

              <label>
                Дата начала *
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </label>

              <label>
                Дата окончания *
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </label>

              <label className="full-width">
                Примечание
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Например, после еды"
                  rows="2"
                  disabled={saving}
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Отмена
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Сохранение...'
                  : editingId !== null
                    ? 'Сохранить изменения'
                    : 'Добавить'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="medications-section">
        <div className="section-heading">
          <div>
            <h2>Расписание лекарств</h2>
            <p>Управляйте списком и временем приёма</p>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="⌕  Поиск по названию..."
          />

          <div className="filter-buttons">
            <button
              className={
                filter === 'all' ? 'filter-button active' : 'filter-button'
              }
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button
              className={
                filter === 'morning'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setFilter('morning')}
            >
              До 12:00
            </button>
            <button
              className={
                filter === 'evening'
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() => setFilter('evening')}
            >
              С 12:00
            </button>
          </div>
        </div>

        {filteredMedications.length === 0 ? (
          <div className="empty-state">
            <div>🔎</div>
            <h3>Лекарства не найдены</h3>
            <p>Измените поисковый запрос или выберите другой фильтр.</p>
          </div>
        ) : (
          <div className="medication-list">
            {filteredMedications.map((medication) => (
              <article className="medication-card" key={medication.id}>
                <div className="medication-symbol">💊</div>

                <div className="medication-info">
                  <h3>{medication.name}</h3>
                  <p className="dosage">{medication.dosage}</p>
                  <p>{medication.frequency}</p>
                  {medication.description && (
                    <p className="description">
                      {medication.description}
                    </p>
                  )}
                  {(medication.startDate || medication.endDate) && (
                    <p className="dates">
                      {medication.startDate || 'Дата не указана'}
                      {' — '}
                      {medication.endDate || 'без даты окончания'}
                    </p>
                  )}
                </div>

                <div className="medication-time">
                  <span>Время приёма</span>
                  <strong>{medication.time}</strong>
                </div>

                <div className="card-actions">
                  <button
                    className="icon-button edit"
                    onClick={() => startEditing(medication)}
                    aria-label={`Редактировать ${medication.name}`}
                    title="Редактировать"
                  >
                    ✎
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => deleteMedication(medication.id)}
                    disabled={deletingId === medication.id}
                    aria-label={`Удалить ${medication.name}`}
                    title="Удалить"
                  >
                    {deletingId === medication.id ? '…' : '🗑'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>Приложение для контроля приёма лекарств</span>
        <span>
          {lastSaved
            ? `Последнее сохранение: ${lastSaved}`
            : 'Ожидание изменений'}
        </span>
      </footer>
    </main>
  )
}

export default App
