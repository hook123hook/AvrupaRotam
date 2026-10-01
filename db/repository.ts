import { getSupabase } from "./index";

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
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone,
      occupation: input.occupation,
      locale: input.locale,
      cv_key: input.cvKey,
      cv_name: input.cvName,
      cv_type: input.cvType,
      cv_size: input.cvSize,
      created_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
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
  const supabase = getSupabase();

  const { error } = await supabase.from("applications").insert({
    id: input.id,
    user_id: input.userId,
    job_title: input.jobTitle,
    country: input.country,
    profession: input.profession,
    message: input.message,
    cv_key: input.cvKey,
    cv_name: input.cvName,
    cv_type: input.cvType,
    cv_size: input.cvSize,
    status: "received",
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getMemberOverview(userId: string) {
  const supabase = getSupabase();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id,email,full_name,phone,occupation,locale,cv_name,updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select(
      "id,job_title,country,profession,status,cv_name,created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (applicationsError) throw applicationsError;

  return {
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          occupation: profile.occupation,
          locale: profile.locale,
          cvName: profile.cv_name,
          updatedAt: profile.updated_at,
        }
      : null,
    applications: (applications ?? []).map((application) => ({
      id: application.id,
      jobTitle: application.job_title,
      country: application.country,
      profession: application.profession,
      status: application.status,
      cvName: application.cv_name,
      createdAt: application.created_at,
    })),
  };
}export async function getMemberCv(userId: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("cv_key,cv_name,cv_type,cv_size")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return data
    ? {
        cvKey: data.cv_key,
        cvName: data.cv_name,
        cvType: data.cv_type,
        cvSize: data.cv_size,
      }
    : null;
}

export async function updateMemberCv(input: {
  userId: string;
  previousCvKey: string;
  cvKey: string;
  cvName: string;
  cvType: string;
  cvSize: number;
}) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      cv_key: input.cvKey,
      cv_name: input.cvName,
      cv_type: input.cvType,
      cv_size: input.cvSize,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.userId)
    .eq("cv_key", input.previousCvKey)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data !== null;
}