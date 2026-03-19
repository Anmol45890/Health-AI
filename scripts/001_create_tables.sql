-- HealthAI Database Schema

-- User Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  allergies TEXT[],
  chronic_conditions TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  predicted_diseases JSONB NOT NULL, -- Array of {name, confidence, severity}
  body_part TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat History table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Goals table
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Predictions policies
CREATE POLICY "predictions_select_own" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "predictions_delete_own" ON public.predictions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Health goals policies
CREATE POLICY "health_goals_select_own" ON public.health_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "health_goals_insert_own" ON public.health_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "health_goals_update_own" ON public.health_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "health_goals_delete_own" ON public.health_goals FOR DELETE USING (auth.uid() = user_id);
