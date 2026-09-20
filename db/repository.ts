import { env } from "cloudflare:workers";

export type ProfileInput = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  occupation: string;
  locale: string;
  cvKey: string;
  cvName: string;
  cvType: string;
  cvSize: number;
};

export async function upsertProfile(input: ProfileInput) {
  const now = new Date().toISOString();
  return env.DB.prepare(
    `INSERT INTO profiles
      (id, email, full_name, phone, occupation, locale, cv_key, cv_name, cv_type, cv_size, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      email = excluded.email,
      full_name = excluded.full_name,
      phone = excluded.phone,
      occupation = excluded.occupation,
      locale = excluded.locale,
      cv_key = excluded.cv_key,
      cv_name = excluded.cv_name,
      cv_type = excluded.cv_type,
      cv_size = excluded.cv_size,
      updated_at = excluded.updated_at`,
  )
    .bind(
      input.id,
      input.email,
      input.fullName,
      input.phone,
      input.occupation,
      input.locale,
      input.cvKey,
      input.cvName,
      input.cvType,
      input.cvSize,
      now,
      now,
    )
    .run();
}

export async function createApplication(input: {
  id: string;
  userId: string;
  jobTitle: string;
  country: string;
  profession: string;
  message: string;
  cvKey: string;
  cvName: string;
  cvType: string;
  cvSize: number;
}) {
  return env.DB.prepare(
    `INSERT INTO applications
      (id, user_id, job_title, country, profession, message, cv_key, cv_name, cv_type, cv_size, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?)`,
  )
    .bind(
      input.id,
      input.userId,
      input.jobTitle,
      input.country,
      input.profession,
      input.message,
      input.cvKey,
      input.cvName,
      input.cvType,
      input.cvSize,
      new Date().toISOString(),
    )
    .run();
}

export async function getMemberOverview(userId: string) {
  const profile = await env.DB.prepare(
    `SELECT id, email, full_name AS fullName, phone, occupation, locale,
            cv_name AS cvName, updated_at AS updatedAt
     FROM profiles WHERE id = ?`,
  )
    .bind(userId)
    .first();
  const applications = await env.DB.prepare(
    `SELECT id, job_title AS jobTitle, country, profession, status,
            cv_name AS cvName, created_at AS createdAt
     FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
  )
    .bind(userId)
    .all();
  return { profile, applications: applications.results };
}
