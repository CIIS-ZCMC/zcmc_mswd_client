import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api'

/**
 * Fixtures are copied from real API responses, not hand-written — a guessed
 * shape once hid a live bug (`employee_number` is a number, `monthly_income` a
 * string). Re-capture with curl when an endpoint changes.
 */

/** As `UserResource` serializes it. */
export const testApiUser = {
  id: 1,
  employee_id: 4021,
  employee_number: 2023060551,
  employee_name: 'Ana Reyes',
  email: 'ana@zcmc.gov.ph',
  role: 'Case Manager',
  roles: ['Case Manager'],
  permissions: [
    'patients.view',
    'patients.create',
    'patients.update',
    'patients.delete',
    'patients.merge',
    'cases.view',
  ],
  is_active: true,
}

/** As `PatientResource` serializes it on a list request. */
export const testApiPatient = {
  id: 1,
  sector_id: 1,
  hospital_id: null,
  mswd_id: null,
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  middle_name: 'Santos',
  extension_name: null,
  birthdate: '1980-05-01T00:00:00.000000Z',
  estimated_age: null,
  sex: 'male',
  civil_status: 'married',
  address: 'Purok 5',
  barangay: 'Sta. Maria',
  municipality: 'Zamboanga City',
  province: null,
  contact_number: '0917-000-0000',
  archived_at: null,
  cases_count: 2,
  sector: { id: 1, name: 'Medical', code: 'MED' },
  created_at: '2026-08-07T07:33:23.000000Z',
  updated_at: '2026-08-07T07:33:23.000000Z',
}

/** Laravel's paginated collection envelope. */
function page<T>(items: T[], perPage = 15) {
  return {
    data: items,
    meta: {
      current_page: 1,
      from: items.length ? 1 : null,
      last_page: 1,
      path: `${API}/patients`,
      per_page: perPage,
      to: items.length || null,
      total: items.length,
    },
  }
}

export const handlers = [
  http.post(`${API}/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.password !== 'correct-password') {
      // Laravel answers bad credentials with a 422 validation error, not a 401.
      return HttpResponse.json(
        {
          message: 'These credentials do not match our records.',
          errors: { email: ['These credentials do not match our records.'] },
        },
        { status: 422 },
      )
    }
    return HttpResponse.json({ data: testApiUser, token: 'test-token', token_type: 'Bearer' })
  }),

  http.get(`${API}/me`, () => HttpResponse.json({ data: testApiUser })),
  http.post(`${API}/logout`, () => new HttpResponse(null, { status: 204 })),

  // Reference lookups.
  http.get(`${API}/sectors`, () =>
    HttpResponse.json({
      data: [
        { id: 1, name: 'Medical', code: 'MED' },
        { id: 2, name: 'Surgery', code: 'SUR' },
      ],
    }),
  ),
  http.get(`${API}/assistant-types`, () =>
    HttpResponse.json({
      data: [{ id: 1, name: 'Medicine', code: 'MED', category: null, is_active: true }],
    }),
  ),
  http.get(`${API}/intervention-types`, () =>
    HttpResponse.json({ data: [{ id: 1, name: 'Counselling', code: 'CNS' }] }),
  ),
  http.get(`${API}/guarantors`, () =>
    HttpResponse.json({ data: [{ id: 1, name: 'PCSO', address: null, is_active: true }] }),
  ),

  // Patients.
  http.get(`${API}/patients`, ({ request }) => {
    const search = new URL(request.url).searchParams.get('search')
    const matches =
      !search || `${testApiPatient.last_name} ${testApiPatient.first_name}`.toLowerCase().includes(search.toLowerCase())
    return HttpResponse.json(page(matches ? [testApiPatient] : []))
  }),

  http.get(`${API}/patients/:id`, () => HttpResponse.json({ data: testApiPatient })),
  http.post(`${API}/patients`, () => HttpResponse.json({ data: testApiPatient }, { status: 201 })),
  http.put(`${API}/patients/:id`, () => HttpResponse.json({ data: testApiPatient })),
  http.delete(`${API}/patients/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/patients/:id/ids`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          patient_id: 1,
          id_type: 'philhealth',
          id_number: 'PH-123456',
          date_issued: null,
          date_expiry: null,
          is_verified: false,
        },
      ],
    }),
  ),

  http.get(`${API}/patients/:id/family-members`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          patient_id: 1,
          name: 'Maria Dela Cruz',
          relationship: 'spouse',
          age: 40,
          occupation: 'vendor',
          // Laravel serializes decimals as strings.
          monthly_income: '5000.00',
          education: null,
          contact_number: null,
          is_living_with_patient: true,
        },
      ],
    }),
  ),

  http.get(`${API}/patients/:id/watchers`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/patients/:id/caretakers`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/patients/:id/documents`, () => HttpResponse.json({ data: [] })),
  http.get(`${API}/patients/:id/duplicates`, () => HttpResponse.json({ data: [] })),

  http.get(`${API}/patients/:id/history`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          log_name: 'patient',
          event: 'created',
          description: 'created',
          subject_type: 'Patient',
          subject_id: 1,
          causer: null,
          changes: { attributes: {} },
          created_at: '2026-08-07T07:33:23.000000Z',
        },
      ],
    }),
  ),
]
