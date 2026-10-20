import { useEffect, useState } from 'react'
import './App.css'

const initialMedications = [
  {
    id: 1,
    name: 'Парацетамол',
    dosage: '500 мг',
    frequency: '1 раз в день',
    time: '09:00',
    startDate: '2026-10-20',
    endDate: '2026-10-27',
    description: 'После еды',
  },
  {
    id: 2,
    name: 'Ибупрофен',
    dosage: '200 мг',
    frequency: '1 раз в день',
    time: '20:00',
    startDate: '2026-10-20',
    endDate: '2026-10-25',
    description: 'После еды',
  },
]

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
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('medications')
        const parsed = saved ? JSON.parse(saved) : initialMedications

        setMedications(
          Array.isArray(parsed) ? parsed : initialMedications,
        )
      } catch {
        setMedications(initialMedications)
      }

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.title = `Мои лекарства (${medications.length})`
  }, [medications.length])

  useEffect(() => {
    if (loading) return

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('medications', JSON.stringify(medications))
        setLastSaved(new Date().toLocaleTimeString())
      } catch {
        setLastSaved('Ошибка сохранения')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [medications, loading])

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch = medication.name
      .toLowerCase()
      .includes(search.toLowerCase())

    if (filter === 'morning') {
      return matchesSearch && medication.time < '12:00'
    }

    if (filter === 'evening') {
      return matchesSearch && medication.time >= '12:00'
    }

    return matchesSearch
  })

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.dosage.trim() || !form.time) {
      return
    }

    if (editingId !== null) {
      setMedications((previous) =>
        previous.map((medication) =>
          medication.id === editingId
            ? { ...form, id: editingId }
            : medication,
        ),
      )
    } else {
      setMedications((previous) => [
        ...previous,
        { ...form, id: Date.now() },
      ])
    }

    resetForm()
  }

  function startEditing(medication) {
    setForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      time: medication.time,
      startDate: medication.startDate,
      endDate: medication.endDate,
      description: medication.description,
    })

    setEditingId(medication.id)
    setShowForm(true)
  }

  function deleteMedication(id) {
    setMedications((previous) =>
      previous.filter((medication) => medication.id !== id),
    )
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
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
            <button className="close-button" onClick={resetForm}>
              ✕
            </button>
          </div>

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
                />
              </label>

              <label>
                Частота приёма
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
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
                />
              </label>

              <label>
                Дата начала
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                Дата окончания
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
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
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Отмена
              </button>
              <button type="submit" className="primary-button">
                {editingId !== null ? 'Сохранить изменения' : 'Добавить'}
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
                    <p className="description">{medication.description}</p>
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
                    aria-label={`Удалить ${medication.name}`}
                    title="Удалить"
                  >
                    🗑
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
            ? `Автосохранение: ${lastSaved}`
            : 'Ожидание изменений'}
        </span>
      </footer>
    </main>
  )
}

export default App