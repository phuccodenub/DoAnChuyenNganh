--
-- PostgreSQL database dump
--

\restrict MuQddh2q21XgJaYp4teUaIMbNVKS9CSvGGGrqLcOENvXXOHNYc9h2sQhxH5pAlO

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: lms_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO lms_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: lms_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: enum_assignment_submissions_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_assignment_submissions_status AS ENUM (
    'submitted',
    'graded',
    'returned'
);


ALTER TYPE public.enum_assignment_submissions_status OWNER TO lms_user;

--
-- Name: enum_assignments_submission_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_assignments_submission_type AS ENUM (
    'file',
    'text',
    'both'
);


ALTER TYPE public.enum_assignments_submission_type OWNER TO lms_user;

--
-- Name: enum_chat_messages_message_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_chat_messages_message_type AS ENUM (
    'text',
    'image',
    'file',
    'system',
    'announcement'
);


ALTER TYPE public.enum_chat_messages_message_type OWNER TO lms_user;

--
-- Name: enum_courses_level; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_courses_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);


ALTER TYPE public.enum_courses_level OWNER TO lms_user;

--
-- Name: enum_courses_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_courses_status AS ENUM (
    'draft',
    'published',
    'archived',
    'suspended'
);


ALTER TYPE public.enum_courses_status OWNER TO lms_user;

--
-- Name: enum_enrollments_enrollment_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_enrollments_enrollment_type AS ENUM (
    'free',
    'paid',
    'gift',
    'scholarship',
    'trial'
);


ALTER TYPE public.enum_enrollments_enrollment_type OWNER TO lms_user;

--
-- Name: enum_enrollments_payment_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_enrollments_payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE public.enum_enrollments_payment_status OWNER TO lms_user;

--
-- Name: enum_enrollments_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_enrollments_status AS ENUM (
    'pending',
    'active',
    'completed',
    'cancelled',
    'suspended'
);


ALTER TYPE public.enum_enrollments_status OWNER TO lms_user;

--
-- Name: enum_grade_components_component_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_grade_components_component_type AS ENUM (
    'quiz',
    'assignment',
    'attendance',
    'participation',
    'manual'
);


ALTER TYPE public.enum_grade_components_component_type OWNER TO lms_user;

--
-- Name: enum_lessons_content_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_lessons_content_type AS ENUM (
    'video',
    'document',
    'text',
    'link',
    'quiz',
    'assignment'
);


ALTER TYPE public.enum_lessons_content_type OWNER TO lms_user;

--
-- Name: enum_live_sessions_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_live_sessions_status AS ENUM (
    'scheduled',
    'live',
    'ended',
    'cancelled'
);


ALTER TYPE public.enum_live_sessions_status OWNER TO lms_user;

--
-- Name: enum_notifications_category; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_notifications_category AS ENUM (
    'course',
    'assignment',
    'quiz',
    'grade',
    'message',
    'system',
    'announcement'
);


ALTER TYPE public.enum_notifications_category OWNER TO lms_user;

--
-- Name: enum_notifications_priority; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_notifications_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE public.enum_notifications_priority OWNER TO lms_user;

--
-- Name: enum_quiz_questions_question_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_quiz_questions_question_type AS ENUM (
    'single_choice',
    'multiple_choice',
    'true_false'
);


ALTER TYPE public.enum_quiz_questions_question_type OWNER TO lms_user;

--
-- Name: enum_users_education_level; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_users_education_level AS ENUM (
    'bachelor',
    'master',
    'phd',
    'professor'
);


ALTER TYPE public.enum_users_education_level OWNER TO lms_user;

--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.enum_users_gender OWNER TO lms_user;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_users_role AS ENUM (
    'student',
    'instructor',
    'admin',
    'super_admin'
);


ALTER TYPE public.enum_users_role OWNER TO lms_user;

--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);


ALTER TYPE public.enum_users_status OWNER TO lms_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO lms_user;

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.assignment_submissions (
    id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    submission_text text,
    file_url text,
    file_name character varying(255),
    submitted_at timestamp with time zone NOT NULL,
    score numeric(5,2),
    feedback text,
    graded_by uuid,
    graded_at timestamp with time zone,
    status public.enum_assignment_submissions_status DEFAULT 'submitted'::public.enum_assignment_submissions_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.assignment_submissions OWNER TO lms_user;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.assignments (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    max_score numeric(5,2) DEFAULT 100 NOT NULL,
    due_date timestamp with time zone,
    allow_late_submission boolean DEFAULT false NOT NULL,
    submission_type public.enum_assignments_submission_type NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.assignments OWNER TO lms_user;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    parent_id uuid,
    icon character varying(100),
    color character varying(20),
    order_index integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    course_count integer DEFAULT 0 NOT NULL,
    metadata json DEFAULT '{}'::json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO lms_user;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.chat_messages (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message_type public.enum_chat_messages_message_type DEFAULT 'text'::public.enum_chat_messages_message_type NOT NULL,
    content text NOT NULL,
    attachment_url character varying(500),
    attachment_name character varying(255),
    attachment_size integer,
    attachment_type character varying(100),
    reply_to_message_id uuid,
    is_edited boolean DEFAULT false NOT NULL,
    edited_at timestamp with time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    is_pinned boolean DEFAULT false NOT NULL,
    pinned_at timestamp with time zone,
    pinned_by uuid,
    reactions json,
    metadata json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO lms_user;

--
-- Name: course_statistics; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_statistics (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    total_enrollments integer DEFAULT 0 NOT NULL,
    active_enrollments integer DEFAULT 0 NOT NULL,
    completion_rate numeric(5,2),
    average_score numeric(5,2),
    updated_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.course_statistics OWNER TO lms_user;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    short_description character varying(500),
    instructor_id uuid NOT NULL,
    level public.enum_courses_level DEFAULT 'beginner'::public.enum_courses_level NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    discount_price numeric(10,2),
    discount_percentage integer,
    discount_start timestamp with time zone,
    discount_end timestamp with time zone,
    thumbnail character varying(500),
    video_intro character varying(500),
    duration_hours integer,
    total_lessons integer DEFAULT 0 NOT NULL,
    total_students integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    total_ratings integer DEFAULT 0 NOT NULL,
    status public.enum_courses_status DEFAULT 'draft'::public.enum_courses_status NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_free boolean DEFAULT false NOT NULL,
    prerequisites json,
    learning_objectives json,
    tags json,
    metadata json,
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    category_id uuid
);


ALTER TABLE public.courses OWNER TO lms_user;

--
-- Name: COLUMN courses.category_id; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.courses.category_id IS 'Danh mục của khóa học';


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.enrollments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    status public.enum_enrollments_status DEFAULT 'pending'::public.enum_enrollments_status NOT NULL,
    enrollment_type public.enum_enrollments_enrollment_type DEFAULT 'free'::public.enum_enrollments_enrollment_type NOT NULL,
    payment_status public.enum_enrollments_payment_status DEFAULT 'pending'::public.enum_enrollments_payment_status NOT NULL,
    payment_method character varying(50),
    payment_id character varying(255),
    amount_paid numeric(10,2),
    currency character varying(3),
    progress_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    completed_lessons integer DEFAULT 0 NOT NULL,
    total_lessons integer DEFAULT 0 NOT NULL,
    last_accessed_at timestamp with time zone,
    completion_date timestamp with time zone,
    certificate_issued boolean DEFAULT false NOT NULL,
    certificate_url character varying(500),
    rating integer,
    review text,
    review_date timestamp with time zone,
    access_expires_at timestamp with time zone,
    metadata json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.enrollments OWNER TO lms_user;

--
-- Name: final_grades; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.final_grades (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    total_score numeric(5,2),
    letter_grade character varying(2),
    calculated_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.final_grades OWNER TO lms_user;

--
-- Name: grade_components; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.grade_components (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    component_type public.enum_grade_components_component_type NOT NULL,
    component_id uuid,
    weight numeric(5,2) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.grade_components OWNER TO lms_user;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.grades (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    component_id uuid,
    score numeric(5,2) NOT NULL,
    max_score numeric(5,2) NOT NULL,
    graded_by uuid,
    graded_at timestamp with time zone NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.grades OWNER TO lms_user;

--
-- Name: lesson_materials; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.lesson_materials (
    id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(50),
    file_size bigint,
    file_extension character varying(10),
    description text,
    download_count integer DEFAULT 0 NOT NULL,
    is_downloadable boolean DEFAULT true NOT NULL,
    uploaded_by uuid,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.lesson_materials OWNER TO lms_user;

--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.lesson_progress (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    last_position integer DEFAULT 0 NOT NULL,
    completion_percentage integer DEFAULT 0 NOT NULL,
    time_spent_seconds integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    last_accessed_at timestamp with time zone,
    notes text,
    bookmarked boolean DEFAULT false NOT NULL,
    quiz_score numeric(5,2),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.lesson_progress OWNER TO lms_user;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.lessons (
    id uuid NOT NULL,
    section_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    content_type public.enum_lessons_content_type DEFAULT 'text'::public.enum_lessons_content_type NOT NULL,
    content text,
    video_url text,
    video_duration integer,
    order_index integer DEFAULT 0 NOT NULL,
    duration_minutes integer,
    is_published boolean DEFAULT false NOT NULL,
    is_free_preview boolean DEFAULT false NOT NULL,
    completion_criteria json DEFAULT '{}'::json,
    metadata json DEFAULT '{}'::json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.lessons OWNER TO lms_user;

--
-- Name: live_session_attendance; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.live_session_attendance (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone NOT NULL,
    left_at timestamp with time zone,
    duration_minutes integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.live_session_attendance OWNER TO lms_user;

--
-- Name: live_sessions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.live_sessions (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    instructor_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes integer,
    meeting_url text,
    meeting_id character varying(100),
    meeting_password character varying(100),
    status public.enum_live_sessions_status DEFAULT 'scheduled'::public.enum_live_sessions_status NOT NULL,
    recording_url text,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.live_sessions OWNER TO lms_user;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    version character varying(10) NOT NULL,
    description text NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.migrations OWNER TO lms_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO lms_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification_recipients; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.notification_recipients (
    id uuid NOT NULL,
    notification_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    is_archived boolean DEFAULT false NOT NULL,
    archived_at timestamp with time zone,
    is_dismissed boolean DEFAULT false NOT NULL,
    dismissed_at timestamp with time zone,
    clicked_at timestamp with time zone,
    interaction_data json DEFAULT '{}'::json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notification_recipients OWNER TO lms_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    sender_id uuid,
    notification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    link_url text,
    priority public.enum_notifications_priority DEFAULT 'normal'::public.enum_notifications_priority NOT NULL,
    category public.enum_notifications_category DEFAULT 'system'::public.enum_notifications_category NOT NULL,
    related_resource_type character varying(50),
    related_resource_id uuid,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    expires_at timestamp with time zone,
    metadata json DEFAULT '{}'::json,
    is_broadcast boolean DEFAULT false NOT NULL,
    total_recipients integer DEFAULT 0 NOT NULL,
    read_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO lms_user;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO lms_user;

--
-- Name: quiz_answers; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_answers (
    id uuid NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_option_id uuid,
    selected_options json,
    is_correct boolean,
    points_earned numeric(5,2),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quiz_answers OWNER TO lms_user;

--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_attempts (
    id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    user_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    score numeric(5,2),
    max_score numeric(5,2),
    started_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone,
    time_spent_minutes integer,
    is_passed boolean,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quiz_attempts OWNER TO lms_user;

--
-- Name: quiz_options; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_options (
    id uuid NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quiz_options OWNER TO lms_user;

--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_questions (
    id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type public.enum_quiz_questions_question_type NOT NULL,
    points numeric(5,2) DEFAULT 1 NOT NULL,
    order_index integer NOT NULL,
    explanation text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO lms_user;

--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quizzes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duration_minutes integer,
    passing_score numeric(5,2),
    max_attempts integer DEFAULT 1 NOT NULL,
    shuffle_questions boolean DEFAULT false NOT NULL,
    show_correct_answers boolean DEFAULT true NOT NULL,
    available_from timestamp with time zone,
    available_until timestamp with time zone,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.quizzes OWNER TO lms_user;

--
-- Name: sections; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.sections (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    duration_minutes integer,
    objectives json DEFAULT '[]'::json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.sections OWNER TO lms_user;

--
-- Name: seeders; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.seeders (
    id integer NOT NULL,
    version character varying(10) NOT NULL,
    description text NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.seeders OWNER TO lms_user;

--
-- Name: seeders_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.seeders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seeders_id_seq OWNER TO lms_user;

--
-- Name: seeders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.seeders_id_seq OWNED BY public.seeders.id;


--
-- Name: user_activity_logs; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.user_activity_logs (
    id uuid NOT NULL,
    user_id uuid,
    activity_type character varying(50) NOT NULL,
    activity_description text,
    ip_address character varying(45),
    user_agent text,
    metadata json DEFAULT '{}'::json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.user_activity_logs OWNER TO lms_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50),
    password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    bio text,
    avatar character varying(500),
    role public.enum_users_role DEFAULT 'student'::public.enum_users_role NOT NULL,
    status public.enum_users_status DEFAULT 'pending'::public.enum_users_status NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    email_verification_token character varying(255),
    email_verification_expires timestamp with time zone,
    password_reset_token character varying(255),
    password_reset_expires timestamp with time zone,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    two_factor_secret character varying(255),
    two_factor_backup_codes json,
    last_login timestamp with time zone,
    login_attempts integer DEFAULT 0 NOT NULL,
    lockout_until timestamp with time zone,
    token_version integer DEFAULT 1 NOT NULL,
    social_id character varying(255),
    social_provider character varying(50),
    preferences json,
    metadata json,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    email_verified_at timestamp with time zone,
    student_id character varying(20),
    class character varying(50),
    major character varying(100),
    year integer,
    gpa numeric(3,2),
    instructor_id character varying(20),
    department character varying(100),
    specialization character varying(200),
    experience_years integer,
    education_level public.enum_users_education_level,
    research_interests text,
    date_of_birth date,
    gender public.enum_users_gender,
    address text,
    emergency_contact character varying(100),
    emergency_phone character varying(20)
);


ALTER TABLE public.users OWNER TO lms_user;

--
-- Name: COLUMN users.email_verified_at; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.email_verified_at IS 'Timestamp when email was verified';


--
-- Name: COLUMN users.student_id; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.student_id IS 'Mã số sinh viên (ví dụ: SV001, 2021001234)';


--
-- Name: COLUMN users.class; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.class IS 'Lớp học (ví dụ: CNTT-K62)';


--
-- Name: COLUMN users.major; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.major IS 'Chuyên ngành';


--
-- Name: COLUMN users.year; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.year IS 'Khóa học (ví dụ: 2021, 2022)';


--
-- Name: COLUMN users.gpa; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.gpa IS 'Điểm trung bình tích lũy (0.00 - 4.00)';


--
-- Name: COLUMN users.instructor_id; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.instructor_id IS 'Mã số giảng viên';


--
-- Name: COLUMN users.department; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.department IS 'Khoa/Bộ môn';


--
-- Name: COLUMN users.specialization; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.specialization IS 'Chuyên môn';


--
-- Name: COLUMN users.experience_years; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.experience_years IS 'Số năm kinh nghiệm giảng dạy';


--
-- Name: COLUMN users.education_level; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.education_level IS 'Trình độ học vấn';


--
-- Name: COLUMN users.research_interests; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.research_interests IS 'Lĩnh vực nghiên cứu quan tâm';


--
-- Name: COLUMN users.date_of_birth; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.date_of_birth IS 'Ngày sinh';


--
-- Name: COLUMN users.gender; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.gender IS 'Giới tính';


--
-- Name: COLUMN users.address; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.address IS 'Địa chỉ';


--
-- Name: COLUMN users.emergency_contact; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.emergency_contact IS 'Liên hệ khẩn cấp';


--
-- Name: COLUMN users.emergency_phone; Type: COMMENT; Schema: public; Owner: lms_user
--

COMMENT ON COLUMN public.users.emergency_phone IS 'Số điện thoại liên hệ khẩn cấp';


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: seeders id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.seeders ALTER COLUMN id SET DEFAULT nextval('public.seeders_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public."SequelizeMeta" (name) FROM stdin;
20251019000000-add-email-verified-at-column.js
20251012031022-add-unique-constraints-to-user-ids.js
20251021214245-cleanup-course-categories.js
\.


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.assignment_submissions (id, assignment_id, user_id, submission_text, file_url, file_name, submitted_at, score, feedback, graded_by, graded_at, status, created_at, updated_at) FROM stdin;
80000000-0000-0000-0000-000000000001	60000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000006	Đây là bài nộp của tôi. Tôi đã hoàn thành tất cả các yêu cầu.	https://example.com/submissions/Huong_dan_nop_bai.pdf	Huong_dan_nop_bai.pdf	2025-11-04 17:00:00+07	12.00	Bài làm tốt! Tuy nhiên cần chú ý hơn về UI/UX.	00000000-0000-0000-0000-000000000003	2025-11-05 21:30:00+07	graded	2025-11-05 02:07:29.955+07	2025-11-05 03:09:57.484+07
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.assignments (id, course_id, title, description, max_score, due_date, allow_late_submission, submission_type, is_published, created_at, updated_at) FROM stdin;
60000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	Bài tập 1: Widgets cơ bản	Hãy nộp bài các câu hỏi dưới đây PDF. Yêu cầu: tối thiểu 2 trang, mô tả tiền tố và văn đề gấp phải.\n\nNội dung bài tập:\n1. Xây dựng màn hình login với TextField và Button\n2. Tạo danh sách sản phẩm với ListView\n3. Implement navigation giữa các màn hình\n4. Sử dụng setState để quản lý form state\n\nYêu cầu:\n- Code phải clean và có comments\n- UI phải responsive\n- Xử lý validation đầu vào\n- Có ít nhất 3 màn hình	40.00	2025-11-07 04:23:00+07	t	both	t	2025-11-05 02:06:54.524+07	2025-11-05 03:09:57.481+07
60000000-0000-0000-0000-000000000002	20000000-0000-0000-0000-000000000001	Quiz: State Management	Hoàn thành bài quiz về State Management.\n\nNội dung:\n- Các khái niệm cơ bản về state\n- Provider pattern\n- setState vs setState callback\n- Best practices\n\nThời gian: 30 phút\nSố câu hỏi: 10\nĐiểm tối đa: 5/40	5.00	2025-11-11 04:23:00+07	f	text	t	2025-11-05 02:06:54.531+07	2025-11-05 03:09:57.482+07
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.categories (id, name, slug, description, parent_id, icon, color, order_index, is_active, course_count, metadata, created_at, updated_at) FROM stdin;
10000000-0000-0000-0000-000000000001	Web Development	web-development	Web Development related courses	\N	💻	#3B82F6	1	t	0	{}	2025-11-04 13:17:11.667817+07	2025-11-04 13:17:11.667817+07
10000000-0000-0000-0000-000000000002	Data Science	data-science	Data Science and ML	\N	📊	#10B981	2	t	0	{}	2025-11-04 13:17:11.679094+07	2025-11-04 13:17:11.679094+07
10000000-0000-0000-0000-000000000003	Programming	programming	General programming	\N	🧠	#6366F1	3	t	0	{}	2025-11-04 13:17:11.681518+07	2025-11-04 13:17:11.681518+07
10000000-0000-0000-0000-000000000004	Design	design	UI/UX and design	\N	🎨	#F59E0B	4	t	0	{}	2025-11-04 13:17:11.684305+07	2025-11-04 13:17:11.684305+07
10000000-0000-0000-0000-000000000005	Business	business	Business and marketing	\N	📈	#EF4444	5	t	0	{}	2025-11-04 13:17:11.687038+07	2025-11-04 13:17:11.687038+07
10000000-0000-0000-0000-000000000101	Frontend	frontend	\N	10000000-0000-0000-0000-000000000001	\N	\N	0	t	0	{}	2025-11-04 13:17:11.692359+07	2025-11-04 13:17:11.692359+07
10000000-0000-0000-0000-000000000102	Backend	backend	\N	10000000-0000-0000-0000-000000000001	\N	\N	0	t	0	{}	2025-11-04 13:17:11.696993+07	2025-11-04 13:17:11.696993+07
10000000-0000-0000-0000-000000000103	Full Stack	full-stack	\N	10000000-0000-0000-0000-000000000001	\N	\N	0	t	0	{}	2025-11-04 13:17:11.699607+07	2025-11-04 13:17:11.699607+07
10000000-0000-0000-0000-000000000201	Machine Learning	machine-learning	\N	10000000-0000-0000-0000-000000000002	\N	\N	0	t	0	{}	2025-11-04 13:17:11.702359+07	2025-11-04 13:17:11.702359+07
10000000-0000-0000-0000-000000000301	JavaScript	javascript	\N	10000000-0000-0000-0000-000000000003	\N	\N	0	t	0	{}	2025-11-04 13:17:11.70542+07	2025-11-04 13:17:11.70542+07
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.chat_messages (id, course_id, user_id, message_type, content, attachment_url, attachment_name, attachment_size, attachment_type, reply_to_message_id, is_edited, edited_at, is_deleted, deleted_at, deleted_by, is_pinned, pinned_at, pinned_by, reactions, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_statistics; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_statistics (id, course_id, total_enrollments, active_enrollments, completion_rate, average_score, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.courses (id, title, description, short_description, instructor_id, level, language, price, currency, discount_price, discount_percentage, discount_start, discount_end, thumbnail, video_intro, duration_hours, total_lessons, total_students, rating, total_ratings, status, is_featured, is_free, prerequisites, learning_objectives, tags, metadata, published_at, created_at, updated_at, category_id) FROM stdin;
10000000-0000-0000-0000-000000000002	Advanced React Development	Master React hooks, context API, and advanced patterns.	\N	00000000-0000-0000-0000-000000000004	advanced	en	49.99	USD	\N	\N	\N	\N	https://via.placeholder.com/400x300?text=Advanced+React	\N	60	0	0	0.00	0	published	t	f	\N	\N	\N	\N	\N	2025-11-03 02:56:57.563+07	2025-11-03 02:56:57.563+07	10000000-0000-0000-0000-000000000001
10000000-0000-0000-0000-000000000003	Machine Learning with Python	Introduction to machine learning concepts using Python and scikit-learn.	\N	00000000-0000-0000-0000-000000000005	intermediate	en	79.99	USD	\N	\N	\N	\N	https://via.placeholder.com/400x300?text=ML+Python	\N	80	0	0	0.00	0	published	f	f	\N	\N	\N	\N	\N	2025-11-03 02:56:57.565+07	2025-11-03 02:56:57.565+07	10000000-0000-0000-0000-000000000001
10000000-0000-0000-0000-000000000005	Full-Stack JavaScript	Complete full-stack course covering React, Node.js, and MongoDB.	\N	00000000-0000-0000-0000-000000000004	intermediate	en	99.99	USD	\N	\N	\N	\N	https://via.placeholder.com/400x300?text=Full-Stack+JS	\N	120	0	0	0.00	0	published	t	f	\N	\N	\N	\N	\N	2025-11-03 02:56:57.569+07	2025-11-03 02:56:57.569+07	10000000-0000-0000-0000-000000000001
10000000-0000-0000-0000-000000000001	Web Development Fundamentals	Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners.	\N	00000000-0000-0000-0000-000000000003	beginner	en	0.00	USD	\N	\N	\N	\N	https://via.placeholder.com/400x300?text=Web+Dev+Fundamentals	\N	40	0	0	0.00	0	published	t	f	\N	\N	\N	\N	\N	2025-11-04 01:37:56.263+07	2025-11-04 01:37:56.263+07	10000000-0000-0000-0000-000000000001
10000000-0000-0000-0000-000000000004	Node.js Backend Development	Build scalable backend APIs with Node.js, Express, and PostgreSQL.	\N	00000000-0000-0000-0000-000000000003	intermediate	en	59.99	USD	\N	\N	\N	\N	https://via.placeholder.com/400x300?text=Node.js+Backend	\N	50	0	0	0.00	0	published	f	f	\N	\N	\N	\N	\N	2025-11-04 01:37:56.314+07	2025-11-04 01:37:56.314+07	10000000-0000-0000-0000-000000000001
20000000-0000-0000-0000-000000000001	Introduction to React Development	Learn React fundamentals: components, hooks, state.\n\nThis comprehensive course will take you from React basics to building real-world applications. You'll learn:\n\n• Core React concepts and component architecture\n• Modern hooks (useState, useEffect, useContext, etc.)\n• State management and data flow\n• Building reusable components\n• Working with forms and events\n• API integration and async operations\n• Routing with React Router\n• Best practices and common patterns\n\nPerfect for beginners with basic JavaScript knowledge who want to master React development.	Learn React fundamentals: components, hooks, state.	00000000-0000-0000-0000-000000000003	beginner	vi	0.00	USD	\N	\N	\N	\N	https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800	https://www.youtube.com/watch?v=SqcY0GlETPk	30	8	23	4.50	18	published	t	t	["Basic HTML/CSS knowledge","JavaScript fundamentals","ES6+ features understanding"]	["Build modern React applications from scratch","Master React Hooks and component lifecycle","Implement state management effectively","Create reusable and maintainable components","Handle forms, events, and user interactions","Integrate APIs and handle async operations","Implement routing in React applications"]	["React","JavaScript","Frontend","Web Development","Hooks"]	{"difficulty_rating":"easy","completion_time":"4-6 weeks","certificate_available":true,"has_subtitles":true}	2024-01-01 07:00:00+07	2025-11-05 02:06:54.404+07	2025-11-05 03:09:57.426+07	10000000-0000-0000-0000-000000000001
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.enrollments (id, user_id, course_id, status, enrollment_type, payment_status, payment_method, payment_id, amount_paid, currency, progress_percentage, completed_lessons, total_lessons, last_accessed_at, completion_date, certificate_issued, certificate_url, rating, review, review_date, access_expires_at, metadata, created_at, updated_at) FROM stdin;
6f8afdf8-b5ab-4936-a67c-32692b1b1a52	00000000-0000-0000-0000-000000000007	10000000-0000-0000-0000-000000000003	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-03 02:56:57.59+07	2025-11-03 02:56:57.59+07
96c2ba36-7d28-49fa-abbf-18399db1df41	00000000-0000-0000-0000-000000000008	10000000-0000-0000-0000-000000000002	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-03 02:56:57.593+07	2025-11-03 02:56:57.593+07
83bf3476-150b-4d19-bbcc-c81ff5bcd246	00000000-0000-0000-0000-000000000008	10000000-0000-0000-0000-000000000005	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-03 02:56:57.595+07	2025-11-03 02:56:57.595+07
46d8e23a-529f-4d0e-8a5f-170b2252eba3	00000000-0000-0000-0000-000000000010	10000000-0000-0000-0000-000000000005	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-03 02:56:57.599+07	2025-11-03 02:56:57.599+07
bbbc2c46-5c4f-441f-b46b-133e3b40d003	00000000-0000-0000-0000-000000000006	10000000-0000-0000-0000-000000000001	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-04 01:37:56.321+07	2025-11-04 01:37:56.321+07
b54c386e-7081-419f-90a8-1102fda690ff	00000000-0000-0000-0000-000000000006	10000000-0000-0000-0000-000000000002	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-04 01:37:56.353+07	2025-11-04 01:37:56.353+07
5c95e099-f560-4f14-ae2b-447ecc3e7eb2	00000000-0000-0000-0000-000000000007	10000000-0000-0000-0000-000000000001	completed	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-04 01:37:56.359+07	2025-11-04 01:37:56.359+07
2013c07d-7dfc-43ea-8d19-599e097b0baa	00000000-0000-0000-0000-000000000009	10000000-0000-0000-0000-000000000004	active	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-04 01:37:56.364+07	2025-11-04 01:37:56.364+07
5eba0883-cff8-48b6-b929-890a6336aa20	00000000-0000-0000-0000-000000000009	10000000-0000-0000-0000-000000000001	completed	free	pending	\N	\N	\N	\N	0.00	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	2025-11-04 01:37:56.367+07	2025-11-04 01:37:56.367+07
a676b7b0-199d-4b37-85de-de05be2b8cb6	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	active	free	pending	\N	\N	\N	\N	80.00	6	8	2025-11-05 03:09:57.486+07	\N	f	\N	5	Khóa học rất hay và dễ hiểu. Giảng viên tận tâm!	2025-11-05 02:07:29.967+07	\N	\N	2025-11-05 02:07:29.967+07	2025-11-05 03:09:57.486+07
\.


--
-- Data for Name: final_grades; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.final_grades (id, user_id, course_id, total_score, letter_grade, calculated_at, created_at, updated_at) FROM stdin;
c535bf23-ec42-42cb-aa65-166bff648ad4	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	83.00	B+	2025-11-05 02:13:41.678+07	2025-11-05 02:13:41.678+07	2025-11-05 03:09:57.538+07
\.


--
-- Data for Name: grade_components; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.grade_components (id, course_id, component_type, component_id, weight, name, created_at, updated_at) FROM stdin;
a0000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	assignment	60000000-0000-0000-0000-000000000001	40.00	Assignments	2025-11-05 02:13:41.653+07	2025-11-05 03:09:57.514+07
a0000000-0000-0000-0000-000000000002	20000000-0000-0000-0000-000000000001	quiz	50000000-0000-0000-0000-000000000001	30.00	Quizzes	2025-11-05 02:13:41.661+07	2025-11-05 03:09:57.515+07
a0000000-0000-0000-0000-000000000003	20000000-0000-0000-0000-000000000001	participation	\N	30.00	Participation	2025-11-05 02:13:41.663+07	2025-11-05 03:09:57.516+07
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.grades (id, user_id, course_id, component_id, score, max_score, graded_by, graded_at, notes, created_at, updated_at) FROM stdin;
b29d2c3c-7741-4255-b189-67f6d3117076	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000001	30.00	40.00	00000000-0000-0000-0000-000000000003	2025-11-05 02:13:41.664+07	Làm bài tốt, cần cải thiện thêm	2025-11-05 02:13:41.664+07	2025-11-05 02:13:41.664+07
2039c1db-d7c3-4b5c-90e6-e3449f3182c9	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	25.00	30.00	00000000-0000-0000-0000-000000000003	2025-11-05 02:13:41.676+07	Hiểu bài khá tốt	2025-11-05 02:13:41.676+07	2025-11-05 02:13:41.676+07
6222cb96-9cf4-4c37-bca9-67d436913c38	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	28.00	30.00	00000000-0000-0000-0000-000000000003	2025-11-05 02:13:41.677+07	Tích cực tham gia	2025-11-05 02:13:41.677+07	2025-11-05 02:13:41.677+07
dbd4fe44-5159-4a95-884f-c877192377eb	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000001	30.00	40.00	00000000-0000-0000-0000-000000000003	2025-11-05 03:09:57.517+07	Làm bài tốt, cần cải thiện thêm	2025-11-05 03:09:57.517+07	2025-11-05 03:09:57.517+07
6939c91c-05f1-4169-ae4c-57a6f52d0f20	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000002	25.00	30.00	00000000-0000-0000-0000-000000000003	2025-11-05 03:09:57.533+07	Hiểu bài khá tốt	2025-11-05 03:09:57.533+07	2025-11-05 03:09:57.533+07
e0c6e8b2-1870-4444-b62d-4b7feb8e4f11	00000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	28.00	30.00	00000000-0000-0000-0000-000000000003	2025-11-05 03:09:57.536+07	Tích cực tham gia	2025-11-05 03:09:57.536+07	2025-11-05 03:09:57.536+07
\.


--
-- Data for Name: lesson_materials; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.lesson_materials (id, lesson_id, file_name, file_url, file_type, file_size, file_extension, description, download_count, is_downloadable, uploaded_by, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.lesson_progress (id, user_id, lesson_id, completed, last_position, completion_percentage, time_spent_seconds, started_at, completed_at, last_accessed_at, notes, bookmarked, quiz_score, created_at, updated_at) FROM stdin;
778be199-fea7-41f1-bc23-19e0ca783e2b	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000001	t	0	100	1800	2025-10-29 02:10:31.331+07	2025-11-05 02:10:31.331+07	2025-11-05 02:10:31.331+07	\N	f	\N	2025-11-05 02:10:31.331+07	2025-11-05 03:09:57.49+07
02ad2e9c-27c6-4631-a487-bb736a209dfa	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000002	t	0	100	1800	2025-10-29 02:10:31.346+07	2025-11-05 02:10:31.346+07	2025-11-05 02:10:31.346+07	\N	f	\N	2025-11-05 02:10:31.346+07	2025-11-05 03:09:57.491+07
7765fdbd-3084-48c7-a14a-d3bc02adf94e	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000003	t	0	100	1800	2025-10-29 02:10:31.346+07	2025-11-05 02:10:31.346+07	2025-11-05 02:10:31.346+07	\N	f	\N	2025-11-05 02:10:31.346+07	2025-11-05 03:09:57.492+07
d7d35a09-d8fd-4a35-968b-1d125bf67b46	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000004	t	0	100	1800	2025-10-29 02:10:31.348+07	2025-11-05 02:10:31.348+07	2025-11-05 02:10:31.348+07	\N	f	\N	2025-11-05 02:10:31.348+07	2025-11-05 03:09:57.493+07
576dd5cd-5f8e-41bb-a6e5-3007c89ce311	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000005	t	0	100	1800	2025-10-29 02:10:31.349+07	2025-11-05 02:10:31.349+07	2025-11-05 02:10:31.349+07	\N	f	\N	2025-11-05 02:10:31.349+07	2025-11-05 03:09:57.493+07
3a1a223e-d0f1-4272-8694-d9c8ce69f500	00000000-0000-0000-0000-000000000006	40000000-0000-0000-0000-000000000006	t	0	100	1800	2025-10-29 02:10:31.349+07	2025-11-05 02:10:31.349+07	2025-11-05 02:10:31.349+07	\N	f	\N	2025-11-05 02:10:31.349+07	2025-11-05 03:09:57.494+07
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.lessons (id, section_id, title, description, content_type, content, video_url, video_duration, order_index, duration_minutes, is_published, is_free_preview, completion_criteria, metadata, created_at, updated_at) FROM stdin;
40000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	Bài 1: Flutter là gì và tại sao nên học?	Giới thiệu tổng quan về Flutter framework và lợi ích của việc sử dụng Flutter	video	<h2>Flutter là gì?</h2>\n<p>Flutter là một framework mã nguồn mở được phát triển bởi Google để xây dựng ứng dụng đa nền tảng.</p>\n\n<h3>Ưu điểm của Flutter:</h3>\n<ul>\n  <li>Hot Reload - Cập nhật code ngay lập tức</li>\n  <li>UI đẹp và mượt mà</li>\n  <li>Hiệu suất cao gần native</li>\n  <li>Một codebase cho nhiều platform</li>\n</ul>	https://www.youtube.com/watch?v=1xipg02Wu8s	900	1	30	t	t	{}	{}	2025-11-05 02:06:54.455+07	2025-11-05 03:09:57.443+07
40000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000001	Bài 2: Hướng dẫn cài đặt môi trường	Cài đặt Flutter SDK, Android Studio, và các công cụ cần thiết	document	<h2>Cài đặt Flutter</h2>\n<ol>\n  <li>Tải Flutter SDK từ trang chính thức</li>\n  <li>Giải nén và thêm vào PATH</li>\n  <li>Chạy flutter doctor để kiểm tra</li>\n  <li>Cài đặt Android Studio hoặc VS Code</li>\n  <li>Cài đặt Flutter plugin</li>\n</ol>\n\n<h3>Yêu cầu hệ thống:</h3>\n<ul>\n  <li>Windows 10 trở lên / macOS / Linux</li>\n  <li>Ít nhất 8GB RAM</li>\n  <li>10GB dung lượng trống</li>\n</ul>	\N	\N	2	45	t	t	{}	{}	2025-11-05 02:06:54.46+07	2025-11-05 03:09:57.445+07
40000000-0000-0000-0000-000000000003	30000000-0000-0000-0000-000000000001	Bài 3: Xây dựng ứng dụng "Hello World"	Tạo ứng dụng Flutter đầu tiên và hiểu cấu trúc project	video	<h2>Hello World App</h2>\n<p>Trong bài này, chúng ta sẽ xây dựng ứng dụng Flutter đầu tiên.</p>\n\n<h3>Các bước thực hiện:</h3>\n<ol>\n  <li>Tạo project mới với flutter create</li>\n  <li>Hiểu cấu trúc thư mục</li>\n  <li>Chỉnh sửa file main.dart</li>\n  <li>Chạy ứng dụng trên emulator</li>\n</ol>	https://www.youtube.com/watch?v=xWV71C2kp38	1200	3	60	t	f	{}	{}	2025-11-05 02:06:54.463+07	2025-11-05 03:09:57.447+07
40000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000002	Bài 1: StatelessWidget và StatefulWidget	Tìm hiểu sự khác biệt giữa StatelessWidget và StatefulWidget	video	<h2>Widgets trong Flutter</h2>\n<p>Widget là thành phần cơ bản nhất trong Flutter. Mọi thứ đều là widget!</p>\n\n<h3>StatelessWidget:</h3>\n<ul>\n  <li>Không thay đổi trạng thái</li>\n  <li>Render một lần</li>\n  <li>Dùng cho UI tĩnh</li>\n</ul>\n\n<h3>StatefulWidget:</h3>\n<ul>\n  <li>Có thể thay đổi trạng thái</li>\n  <li>Re-render khi state thay đổi</li>\n  <li>Dùng cho UI động</li>\n</ul>	https://www.youtube.com/watch?v=p5dkB3Mrxdo	1500	1	50	t	f	{}	{}	2025-11-05 02:06:54.465+07	2025-11-05 03:09:57.448+07
40000000-0000-0000-0000-000000000005	30000000-0000-0000-0000-000000000002	Bài 2: Layout Widgets (Container, Row, Column)	Học cách sắp xếp layout với Container, Row, Column	video	<h2>Layout Widgets</h2>\n<p>Flutter cung cấp nhiều widget để xây dựng layout phức tạp.</p>\n\n<h3>Container:</h3>\n<ul>\n  <li>Widget đa năng nhất</li>\n  <li>Padding, margin, decoration</li>\n  <li>Có thể chứa widget con</li>\n</ul>\n\n<h3>Row & Column:</h3>\n<ul>\n  <li>Row: Sắp xếp ngang</li>\n  <li>Column: Sắp xếp dọc</li>\n  <li>MainAxis và CrossAxis</li>\n</ul>	https://www.youtube.com/watch?v=RJEnTRBxaSg	1800	2	70	t	f	{}	{}	2025-11-05 02:06:54.468+07	2025-11-05 03:09:57.449+07
40000000-0000-0000-0000-000000000006	30000000-0000-0000-0000-000000000002	Bài 3: Text, Image, và Button Widgets	Làm việc với các widget hiển thị nội dung và tương tác	text	<h2>Basic Widgets</h2>\n\n<h3>Text Widget:</h3>\n<pre><code>Text(\n  'Hello Flutter',\n  style: TextStyle(fontSize: 24, color: Colors.blue),\n)</code></pre>\n\n<h3>Image Widget:</h3>\n<pre><code>Image.network('https://example.com/image.png')\nImage.asset('assets/logo.png')</code></pre>\n\n<h3>Button Widgets:</h3>\n<pre><code>ElevatedButton(\n  onPressed: () {},\n  child: Text('Click me'),\n)\n\nTextButton(...)\nIconButton(...)</code></pre>	\N	\N	3	40	t	f	{}	{}	2025-11-05 02:06:54.471+07	2025-11-05 03:09:57.45+07
40000000-0000-0000-0000-000000000007	30000000-0000-0000-0000-000000000003	Bài 1: Navigator.push và Navigator.pop	Điều hướng cơ bản giữa các màn hình	video	<h2>Basic Navigation</h2>\n<p>Học cách chuyển đổi giữa các màn hình trong Flutter.</p>\n\n<h3>Navigator.push:</h3>\n<pre><code>Navigator.push(\n  context,\n  MaterialPageRoute(builder: (context) => SecondScreen()),\n);</code></pre>\n\n<h3>Navigator.pop:</h3>\n<pre><code>Navigator.pop(context);</code></pre>	https://www.youtube.com/watch?v=nyvwx7o277U	1200	1	50	t	f	{}	{}	2025-11-05 02:06:54.473+07	2025-11-05 03:09:57.452+07
40000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000003	Bài 2: Named Routes và Route Parameters	Sử dụng named routes và truyền dữ liệu giữa màn hình	text	<h2>Named Routes</h2>\n\n<h3>Định nghĩa routes:</h3>\n<pre><code>MaterialApp(\n  routes: {\n    '/': (context) => HomeScreen(),\n    '/second': (context) => SecondScreen(),\n  },\n)</code></pre>\n\n<h3>Điều hướng:</h3>\n<pre><code>Navigator.pushNamed(context, '/second');</code></pre>\n\n<h3>Truyền arguments:</h3>\n<pre><code>Navigator.pushNamed(\n  context, \n  '/second',\n  arguments: {'id': 123},\n);</code></pre>	\N	\N	2	60	t	f	{}	{}	2025-11-05 02:06:54.474+07	2025-11-05 03:09:57.453+07
\.


--
-- Data for Name: live_session_attendance; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.live_session_attendance (id, session_id, user_id, joined_at, left_at, duration_minutes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: live_sessions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.live_sessions (id, course_id, instructor_id, title, description, scheduled_at, duration_minutes, meeting_url, meeting_id, meeting_password, status, recording_url, started_at, ended_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.migrations (id, version, description, executed_at) FROM stdin;
1	001	Create users table	2025-10-13 18:46:25.393729
2	002	Create courses table	2025-10-13 18:46:25.419245
3	003	Create enrollments table	2025-10-13 18:46:25.466633
4	004	Create chat messages table	2025-10-13 18:46:25.484068
5	005	Add indexes to users table	2025-10-13 18:46:25.51492
6	006	Add indexes to courses table	2025-10-13 18:46:25.550613
7	007	Add indexes to enrollments table	2025-10-13 18:46:25.581208
8	008	Add indexes to chat messages table	2025-10-13 18:46:25.611853
9	009	Create extended LMS tables and alter existing ones	2025-10-19 10:53:44.629442
10	010	Add email_verified_at column and index to users	2025-10-30 04:18:15.816656
11	011	Add missing user profile columns to users table	2025-10-30 04:18:15.89196
\.


--
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.notification_recipients (id, notification_id, recipient_id, is_read, read_at, is_archived, archived_at, is_dismissed, dismissed_at, clicked_at, interaction_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.notifications (id, sender_id, notification_type, title, message, link_url, priority, category, related_resource_type, related_resource_id, scheduled_at, sent_at, expires_at, metadata, is_broadcast, total_recipients, read_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_answers; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_answers (id, attempt_id, question_id, selected_option_id, selected_options, is_correct, points_earned, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_attempts (id, quiz_id, user_id, attempt_number, score, max_score, started_at, submitted_at, time_spent_minutes, is_passed, created_at, updated_at) FROM stdin;
90000000-0000-0000-0000-000000000001	50000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000006	1	25.00	30.00	2025-11-01 21:00:00+07	2025-11-01 21:25:00+07	25	t	2025-11-05 02:10:31.368+07	2025-11-05 03:09:57.512+07
\.


--
-- Data for Name: quiz_options; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_options (id, question_id, option_text, is_correct, order_index, created_at, updated_at) FROM stdin;
95af29d8-052b-450c-b690-48547d4dfa14	70000000-0000-0000-0000-000000000001	Quản lý state trong component	t	1	2025-11-05 02:06:54.491+07	2025-11-05 02:06:54.491+07
28f4f61e-a857-40b9-8378-36cddb696aeb	70000000-0000-0000-0000-000000000001	Fetch data từ API	f	2	2025-11-05 02:06:54.497+07	2025-11-05 02:06:54.497+07
f0135626-673f-4b5a-8aca-088c973abbea	70000000-0000-0000-0000-000000000001	Tạo side effects	f	3	2025-11-05 02:06:54.498+07	2025-11-05 02:06:54.498+07
9821296b-5bc4-473e-bb05-8149a43febda	70000000-0000-0000-0000-000000000001	Điều hướng routing	f	4	2025-11-05 02:06:54.498+07	2025-11-05 02:06:54.498+07
fd2b3969-7592-4a75-8470-ac50cea49ec2	70000000-0000-0000-0000-000000000002	Đúng	t	1	2025-11-05 02:06:54.502+07	2025-11-05 02:06:54.502+07
2b681a41-0db8-41b2-9aa4-463be2320e6f	70000000-0000-0000-0000-000000000002	Sai	f	2	2025-11-05 02:06:54.503+07	2025-11-05 02:06:54.503+07
3e603417-63da-44e0-bed5-596863ad482f	70000000-0000-0000-0000-000000000003	useState	t	1	2025-11-05 02:06:54.506+07	2025-11-05 02:06:54.506+07
3efa71ed-1b95-42c8-81a9-b21eb2e853da	70000000-0000-0000-0000-000000000003	useEffect	t	2	2025-11-05 02:06:54.507+07	2025-11-05 02:06:54.507+07
bdaf87f8-4dc1-40b6-a7ff-83647035be9d	70000000-0000-0000-0000-000000000003	useContext	t	3	2025-11-05 02:06:54.508+07	2025-11-05 02:06:54.508+07
cdf9b7e5-8d14-4056-927f-987e096339dc	70000000-0000-0000-0000-000000000003	useCustomHook	f	4	2025-11-05 02:06:54.509+07	2025-11-05 02:06:54.509+07
ba687486-b09d-4985-9caa-17f2c9895f72	70000000-0000-0000-0000-000000000004	Khi cần memoize functions	t	1	2025-11-05 02:06:54.513+07	2025-11-05 02:06:54.513+07
f9db89ee-6189-4b5e-9a14-d4b3db26c773	70000000-0000-0000-0000-000000000004	Khi cần quản lý state	f	2	2025-11-05 02:06:54.515+07	2025-11-05 02:06:54.515+07
f1deddcc-8d18-4f3c-86b0-eb3cb832afc1	70000000-0000-0000-0000-000000000004	Khi cần fetch data	f	3	2025-11-05 02:06:54.516+07	2025-11-05 02:06:54.516+07
192bf8f0-bec4-410f-8c4e-26e78d0c7da1	70000000-0000-0000-0000-000000000004	Khi cần tạo component	f	4	2025-11-05 02:06:54.518+07	2025-11-05 02:06:54.518+07
e01bd2df-ef41-4cc9-8d47-2c85a6694c75	70000000-0000-0000-0000-000000000005	Đúng	f	1	2025-11-05 02:06:54.521+07	2025-11-05 02:06:54.521+07
35b71dd1-d326-4158-aacc-2cbc4742438b	70000000-0000-0000-0000-000000000005	Sai	t	2	2025-11-05 02:06:54.522+07	2025-11-05 02:06:54.522+07
8c2e13b0-67a6-4432-a269-2d225d122f3f	70000000-0000-0000-0000-000000000001	Quản lý state trong component	t	1	2025-11-05 02:07:29.936+07	2025-11-05 02:07:29.936+07
24cf1939-1d88-4246-9242-05dd920ef165	70000000-0000-0000-0000-000000000001	Fetch data từ API	f	2	2025-11-05 02:07:29.94+07	2025-11-05 02:07:29.94+07
6ffb08d6-ac1b-4ea6-a300-fbdeaf4b1410	70000000-0000-0000-0000-000000000001	Tạo side effects	f	3	2025-11-05 02:07:29.941+07	2025-11-05 02:07:29.941+07
b5142d62-be15-445d-bed0-6914cbfd2cdf	70000000-0000-0000-0000-000000000001	Điều hướng routing	f	4	2025-11-05 02:07:29.941+07	2025-11-05 02:07:29.941+07
5a5d6fd5-fa7f-47e1-9035-16c98c3cd62c	70000000-0000-0000-0000-000000000002	Đúng	t	1	2025-11-05 02:07:29.942+07	2025-11-05 02:07:29.942+07
cedb939c-ae1f-423d-9cf2-acdfefde5434	70000000-0000-0000-0000-000000000002	Sai	f	2	2025-11-05 02:07:29.943+07	2025-11-05 02:07:29.943+07
450ecafe-0881-416c-8fa7-18b661f552fc	70000000-0000-0000-0000-000000000003	useState	t	1	2025-11-05 02:07:29.945+07	2025-11-05 02:07:29.945+07
2cae153e-c5c1-4ac0-a4a3-6a82a0a69c01	70000000-0000-0000-0000-000000000003	useEffect	t	2	2025-11-05 02:07:29.945+07	2025-11-05 02:07:29.945+07
03560920-edc2-4d18-a600-25f71bead8e4	70000000-0000-0000-0000-000000000003	useContext	t	3	2025-11-05 02:07:29.946+07	2025-11-05 02:07:29.946+07
8dce180e-bbf4-4e26-a9a3-1833ccf1b5ef	70000000-0000-0000-0000-000000000003	useCustomHook	f	4	2025-11-05 02:07:29.946+07	2025-11-05 02:07:29.946+07
ffad1818-cdae-464a-af9f-978aa64d9ad7	70000000-0000-0000-0000-000000000004	Khi cần memoize functions	t	1	2025-11-05 02:07:29.947+07	2025-11-05 02:07:29.947+07
30d9de75-888f-4313-be42-12cf13072f72	70000000-0000-0000-0000-000000000004	Khi cần quản lý state	f	2	2025-11-05 02:07:29.948+07	2025-11-05 02:07:29.948+07
6c109a24-982b-4702-a159-c76d0a3071c1	70000000-0000-0000-0000-000000000004	Khi cần fetch data	f	3	2025-11-05 02:07:29.948+07	2025-11-05 02:07:29.948+07
75c6b093-6df3-4965-82a2-39c7c95f0081	70000000-0000-0000-0000-000000000004	Khi cần tạo component	f	4	2025-11-05 02:07:29.948+07	2025-11-05 02:07:29.948+07
db020e80-871c-4caa-92a7-a951d6b440f4	70000000-0000-0000-0000-000000000005	Đúng	f	1	2025-11-05 02:07:29.949+07	2025-11-05 02:07:29.949+07
baa9c658-6603-463b-9290-561188db5f6e	70000000-0000-0000-0000-000000000005	Sai	t	2	2025-11-05 02:07:29.95+07	2025-11-05 02:07:29.95+07
513de4df-39f9-457d-958a-2d918b3aa698	70000000-0000-0000-0000-000000000001	Quản lý state trong component	t	1	2025-11-05 02:10:31.306+07	2025-11-05 02:10:31.306+07
ef114d9e-925c-46f1-84d2-3652eaf69033	70000000-0000-0000-0000-000000000001	Fetch data từ API	f	2	2025-11-05 02:10:31.31+07	2025-11-05 02:10:31.31+07
eba31b24-f505-4430-9270-7df9ab51e960	70000000-0000-0000-0000-000000000001	Tạo side effects	f	3	2025-11-05 02:10:31.311+07	2025-11-05 02:10:31.311+07
7d3caa50-015c-4564-b55c-0eee640f0cd5	70000000-0000-0000-0000-000000000001	Điều hướng routing	f	4	2025-11-05 02:10:31.311+07	2025-11-05 02:10:31.311+07
5fa729e8-ccf9-45bb-96e2-3624f89e8d05	70000000-0000-0000-0000-000000000002	Đúng	t	1	2025-11-05 02:10:31.313+07	2025-11-05 02:10:31.313+07
9ca61b83-26a8-4cf0-8805-49ebcb7a3664	70000000-0000-0000-0000-000000000002	Sai	f	2	2025-11-05 02:10:31.314+07	2025-11-05 02:10:31.314+07
5055a792-6a4e-454e-9910-37fa67d8962a	70000000-0000-0000-0000-000000000003	useState	t	1	2025-11-05 02:10:31.315+07	2025-11-05 02:10:31.315+07
2327ed76-567d-4205-b0de-c0686349e7b3	70000000-0000-0000-0000-000000000003	useEffect	t	2	2025-11-05 02:10:31.316+07	2025-11-05 02:10:31.316+07
7f61f0aa-0b7b-4139-b3f5-e7eea8b3d23d	70000000-0000-0000-0000-000000000003	useContext	t	3	2025-11-05 02:10:31.316+07	2025-11-05 02:10:31.316+07
476a96b5-0d75-4703-aa0c-79eb8aba5666	70000000-0000-0000-0000-000000000003	useCustomHook	f	4	2025-11-05 02:10:31.317+07	2025-11-05 02:10:31.317+07
2ac1a5c2-8ca7-43a9-aea7-34842fa56b45	70000000-0000-0000-0000-000000000004	Khi cần memoize functions	t	1	2025-11-05 02:10:31.319+07	2025-11-05 02:10:31.319+07
c89d5b97-4c87-4f96-b376-4f33db432953	70000000-0000-0000-0000-000000000004	Khi cần quản lý state	f	2	2025-11-05 02:10:31.319+07	2025-11-05 02:10:31.319+07
46c59150-1451-4b6c-a991-b3b3e917fb6e	70000000-0000-0000-0000-000000000004	Khi cần fetch data	f	3	2025-11-05 02:10:31.32+07	2025-11-05 02:10:31.32+07
f0d4ed48-19b0-40f8-a9e4-371ddb11b3d5	70000000-0000-0000-0000-000000000004	Khi cần tạo component	f	4	2025-11-05 02:10:31.321+07	2025-11-05 02:10:31.321+07
7a332378-2554-4463-b826-2d28c7940307	70000000-0000-0000-0000-000000000005	Đúng	f	1	2025-11-05 02:10:31.323+07	2025-11-05 02:10:31.323+07
d7392245-5aae-4df9-9ef7-e8611f93e391	70000000-0000-0000-0000-000000000005	Sai	t	2	2025-11-05 02:10:31.324+07	2025-11-05 02:10:31.324+07
701c1ca6-6431-4345-9a49-7e430ba5bb3d	70000000-0000-0000-0000-000000000001	Quản lý state trong component	t	1	2025-11-05 02:13:41.611+07	2025-11-05 02:13:41.611+07
75d4b859-f2f2-486f-9f5a-013b481a0632	70000000-0000-0000-0000-000000000001	Fetch data từ API	f	2	2025-11-05 02:13:41.615+07	2025-11-05 02:13:41.615+07
fe3d5b67-151c-4aa4-9136-1364a8529354	70000000-0000-0000-0000-000000000001	Tạo side effects	f	3	2025-11-05 02:13:41.615+07	2025-11-05 02:13:41.615+07
aaef0343-04c8-4ad3-ace4-248f55d78677	70000000-0000-0000-0000-000000000001	Điều hướng routing	f	4	2025-11-05 02:13:41.616+07	2025-11-05 02:13:41.616+07
a993960c-bb4e-44be-84a0-d725cf1e2589	70000000-0000-0000-0000-000000000002	Đúng	t	1	2025-11-05 02:13:41.617+07	2025-11-05 02:13:41.617+07
9538674b-5328-4954-8a60-2254b9a5c716	70000000-0000-0000-0000-000000000002	Sai	f	2	2025-11-05 02:13:41.618+07	2025-11-05 02:13:41.618+07
f3145c1a-ffd5-4dfc-b149-907f6bb91c1c	70000000-0000-0000-0000-000000000003	useState	t	1	2025-11-05 02:13:41.62+07	2025-11-05 02:13:41.62+07
117a9ec3-a4ba-42df-a03d-c6b632a36f66	70000000-0000-0000-0000-000000000003	useEffect	t	2	2025-11-05 02:13:41.62+07	2025-11-05 02:13:41.62+07
e4e423e1-6487-4d9a-9616-6b130a572dae	70000000-0000-0000-0000-000000000003	useContext	t	3	2025-11-05 02:13:41.621+07	2025-11-05 02:13:41.621+07
bc181e71-06b5-4260-9158-b67add6a6b20	70000000-0000-0000-0000-000000000003	useCustomHook	f	4	2025-11-05 02:13:41.621+07	2025-11-05 02:13:41.621+07
7907b26a-edc0-49bb-a811-b247fa398291	70000000-0000-0000-0000-000000000004	Khi cần memoize functions	t	1	2025-11-05 02:13:41.622+07	2025-11-05 02:13:41.622+07
0faaaa0c-f590-423c-9acc-4b879ade1d62	70000000-0000-0000-0000-000000000004	Khi cần quản lý state	f	2	2025-11-05 02:13:41.623+07	2025-11-05 02:13:41.623+07
e64a4ec2-cd55-4e26-a30c-e3dbeaca1998	70000000-0000-0000-0000-000000000004	Khi cần fetch data	f	3	2025-11-05 02:13:41.623+07	2025-11-05 02:13:41.623+07
f391397d-a340-481b-bd9f-2c0c65ace5d9	70000000-0000-0000-0000-000000000004	Khi cần tạo component	f	4	2025-11-05 02:13:41.624+07	2025-11-05 02:13:41.624+07
780b3684-1f87-4cb5-9761-880a85b6221c	70000000-0000-0000-0000-000000000005	Đúng	f	1	2025-11-05 02:13:41.625+07	2025-11-05 02:13:41.625+07
bd1260ab-7d2d-4af1-8c66-88c9220f32b6	70000000-0000-0000-0000-000000000005	Sai	t	2	2025-11-05 02:13:41.625+07	2025-11-05 02:13:41.625+07
3db2fbb8-7dca-4317-b7cd-2a2c0799f461	70000000-0000-0000-0000-000000000001	Quản lý state trong component	t	1	2025-11-05 03:09:57.461+07	2025-11-05 03:09:57.461+07
59062a71-4dd1-4a00-aa23-0b387f6d061f	70000000-0000-0000-0000-000000000001	Fetch data từ API	f	2	2025-11-05 03:09:57.464+07	2025-11-05 03:09:57.464+07
bb09f77b-543c-4118-9cd1-d73dac2624cf	70000000-0000-0000-0000-000000000001	Tạo side effects	f	3	2025-11-05 03:09:57.465+07	2025-11-05 03:09:57.465+07
727706dd-ec21-440b-8f66-c611ea6f5859	70000000-0000-0000-0000-000000000001	Điều hướng routing	f	4	2025-11-05 03:09:57.466+07	2025-11-05 03:09:57.466+07
8408cffd-46e8-4b64-a1e5-33bb90b0c5be	70000000-0000-0000-0000-000000000002	Đúng	t	1	2025-11-05 03:09:57.468+07	2025-11-05 03:09:57.468+07
a64fbfcb-022b-4f1e-befd-ccb65ca9ca9e	70000000-0000-0000-0000-000000000002	Sai	f	2	2025-11-05 03:09:57.469+07	2025-11-05 03:09:57.469+07
40e1dc10-305d-4ce7-95f8-6328e3bb6ed5	70000000-0000-0000-0000-000000000003	useState	t	1	2025-11-05 03:09:57.471+07	2025-11-05 03:09:57.471+07
6e539c23-b997-400c-ae5d-472cdabad58c	70000000-0000-0000-0000-000000000003	useEffect	t	2	2025-11-05 03:09:57.472+07	2025-11-05 03:09:57.472+07
2291e0d7-e7c5-42b3-bd90-cf34546a88e9	70000000-0000-0000-0000-000000000003	useContext	t	3	2025-11-05 03:09:57.473+07	2025-11-05 03:09:57.473+07
d09a804f-99bd-436c-bf73-43399fa92e91	70000000-0000-0000-0000-000000000003	useCustomHook	f	4	2025-11-05 03:09:57.473+07	2025-11-05 03:09:57.473+07
6731b366-8012-45f1-b806-9e1314d4234f	70000000-0000-0000-0000-000000000004	Khi cần memoize functions	t	1	2025-11-05 03:09:57.475+07	2025-11-05 03:09:57.475+07
2ce393cf-b801-40cc-a420-20a60e80b819	70000000-0000-0000-0000-000000000004	Khi cần quản lý state	f	2	2025-11-05 03:09:57.476+07	2025-11-05 03:09:57.476+07
29cf1282-1f3f-4609-9a63-ff4204b5848a	70000000-0000-0000-0000-000000000004	Khi cần fetch data	f	3	2025-11-05 03:09:57.477+07	2025-11-05 03:09:57.477+07
f324e663-620a-4cc8-8b2e-e2ade985a8e0	70000000-0000-0000-0000-000000000004	Khi cần tạo component	f	4	2025-11-05 03:09:57.477+07	2025-11-05 03:09:57.477+07
25655493-9db6-4168-892b-e23d5f48f4c2	70000000-0000-0000-0000-000000000005	Đúng	f	1	2025-11-05 03:09:57.479+07	2025-11-05 03:09:57.479+07
6afbd9c3-839f-4382-8ae6-ffec0aa8c755	70000000-0000-0000-0000-000000000005	Sai	t	2	2025-11-05 03:09:57.48+07	2025-11-05 03:09:57.48+07
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_questions (id, quiz_id, question_text, question_type, points, order_index, explanation, created_at, updated_at) FROM stdin;
70000000-0000-0000-0000-000000000001	50000000-0000-0000-0000-000000000001	useState hook được sử dụng để làm gì?	single_choice	10.00	1	useState là hook để quản lý state trong functional component	2025-11-05 02:06:54.486+07	2025-11-05 03:09:57.459+07
70000000-0000-0000-0000-000000000002	50000000-0000-0000-0000-000000000001	useEffect có thể được sử dụng để thực hiện side effects?	true_false	5.00	2	useEffect được thiết kế đặc biệt để xử lý side effects	2025-11-05 02:06:54.499+07	2025-11-05 03:09:57.467+07
70000000-0000-0000-0000-000000000003	50000000-0000-0000-0000-000000000001	Các hooks nào sau đây là built-in hooks của React?	multiple_choice	15.00	3	useState, useEffect, useContext đều là built-in hooks	2025-11-05 02:06:54.505+07	2025-11-05 03:09:57.47+07
70000000-0000-0000-0000-000000000004	50000000-0000-0000-0000-000000000002	Khi nào nên sử dụng useCallback?	single_choice	10.00	1	useCallback được dùng để memoize functions	2025-11-05 02:06:54.51+07	2025-11-05 03:09:57.474+07
70000000-0000-0000-0000-000000000005	50000000-0000-0000-0000-000000000002	useMemo và useCallback có chức năng giống nhau?	true_false	5.00	2	useMemo memoize values, useCallback memoize functions	2025-11-05 02:06:54.519+07	2025-11-05 03:09:57.478+07
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quizzes (id, course_id, title, description, duration_minutes, passing_score, max_attempts, shuffle_questions, show_correct_answers, available_from, available_until, is_published, created_at, updated_at) FROM stdin;
50000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	Quiz: State Management	Kiểm tra kiến thức về quản lý state trong React	30	70.00	3	t	t	2024-01-01 07:00:00+07	\N	t	2025-11-05 02:06:54.477+07	2025-11-05 03:09:57.455+07
50000000-0000-0000-0000-000000000002	20000000-0000-0000-0000-000000000001	Quiz: React Hooks	Bài kiểm tra về React Hooks	25	75.00	2	f	t	2024-01-01 07:00:00+07	\N	t	2025-11-05 02:06:54.484+07	2025-11-05 03:09:57.457+07
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.sections (id, course_id, title, description, order_index, is_published, duration_minutes, objectives, created_at, updated_at) FROM stdin;
30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000001	Chương 1: Giới thiệu về Flutter	Tìm hiểu cơ bản về Flutter framework và môi trường phát triển	1	t	180	["Hiểu Flutter là gì và tại sao nên học","Cài đặt môi trường phát triển","Xây dựng ứng dụng Hello World đầu tiên"]	2025-11-05 02:06:54.435+07	2025-11-05 03:09:57.437+07
30000000-0000-0000-0000-000000000002	20000000-0000-0000-0000-000000000001	Chương 2: Widgets cơ bản	Học về các widgets cơ bản trong Flutter	2	t	240	["Hiểu khái niệm Widget trong Flutter","Sử dụng StatelessWidget và StatefulWidget","Xây dựng giao diện với các widgets phổ biến"]	2025-11-05 02:06:54.448+07	2025-11-05 03:09:57.439+07
30000000-0000-0000-0000-000000000003	20000000-0000-0000-0000-000000000001	Chương 3: Navigation và Routing	Tìm hiểu về điều hướng giữa các màn hình	3	t	200	["Điều hướng cơ bản với Navigator","Named routes và route parameters","Advanced navigation patterns"]	2025-11-05 02:06:54.451+07	2025-11-05 03:09:57.441+07
\.


--
-- Data for Name: seeders; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.seeders (id, version, description, executed_at) FROM stdin;
\.


--
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.user_activity_logs (id, user_id, activity_type, activity_description, ip_address, user_agent, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.users (id, email, username, password, first_name, last_name, phone, bio, avatar, role, status, email_verified, email_verification_token, email_verification_expires, password_reset_token, password_reset_expires, two_factor_enabled, two_factor_secret, two_factor_backup_codes, last_login, login_attempts, lockout_until, token_version, social_id, social_provider, preferences, metadata, created_at, updated_at, email_verified_at, student_id, class, major, year, gpa, instructor_id, department, specialization, experience_years, education_level, research_interests, date_of_birth, gender, address, emergency_contact, emergency_phone) FROM stdin;
00000000-0000-0000-0000-000000000004	instructor2@example.com	instructor2	$2b$12$PlUIvWpPRQwKtmNTBrnaYuZPNhC7MDQlfKsVv2rWDq/3cY0xFANwi	Jane	Smith	+84901000004	Full-stack developer and educator. Passionate about teaching modern JavaScript frameworks.	\N	instructor	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.524+07	2025-11-03 02:56:57.524+07	\N	\N	\N	\N	\N	\N	INS002	Computer Science	Full-Stack Development, JavaScript	8	master	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000005	instructor3@example.com	instructor3	$2b$12$E4vl.GbHBMVKroXRAn4NnuSxSYVlubK9DsUTgG5MgVkouSQXW5YXm	Mike	Johnson	+84901000005	Data scientist and machine learning expert with Ph.D. in Computer Science.	\N	instructor	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.525+07	2025-11-03 02:56:57.525+07	\N	\N	\N	\N	\N	\N	INS003	Computer Science	Machine Learning, Data Science, AI	12	phd	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000001	superadmin@example.com	superadmin	$2b$12$E7F2ajMXVrv8bemKoBVLqOp3Ey7.4W.SQuKBWmcfCMCyPZQgEY4rS	Super	Admin	+84901000001	System Super Administrator	\N	admin	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.506+07	2025-11-03 10:23:10.514+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000008	student3@example.com	student3	$2b$12$WEQjgulKyMyOiLkgiZO7uODROiCJnVgooLireeaxsYZtY81tzRMuO	Carol	Davis	+84901000008	Frontend developer learning advanced React patterns.	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.53+07	2025-11-03 02:56:57.53+07	\N	STU2024003	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000009	student4@example.com	student4	$2b$12$EcEf77il/vnwGmfac9pVI.UNsPYIwSECEYOvyDePZdQIgJb6Sg5Jy	David	Miller	+84901000009	Backend developer learning Node.js and databases.	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.532+07	2025-11-03 02:56:57.532+07	\N	STU2024004	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000010	student5@example.com	student5	$2b$12$ZUZLJ87S5zhrM955CQ7GaOrWKf6ZK.SBLSYwEu.e2p232i5EYzscu	Eva	Garcia	+84901000010	Mobile developer learning React Native.	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.534+07	2025-11-03 02:56:57.534+07	\N	STU2024005	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000012	suspended@example.com	suspended	$2b$12$2J25hPPuGMe8cZSXz1fyw.acTxL9gVXXs2CZfB8ZMQ4fsLtrO4bZq	Suspended	User	\N	\N	\N	student	suspended	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.537+07	2025-11-03 02:56:57.537+07	\N	STU2024012	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20000000-0000-0000-0000-000000000021	instructor@example.com	instructor	$2b$12$6x3zap1PEpWxTLT7MUeM9uegi/gqqzkIvORf8I8pQ.HNZz00ghNz6	John	Instructor	\N	\N	\N	instructor	active	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 10:16:50.599+07	2025-11-03 10:23:11.288+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000007	student2@example.com	student2	$2b$12$R3NpC320blNzOp5Gzx9Aze1rueAZ24fu9FXRAY9vTpGazmrZJxkkK	Bob	Wilson	+84901000007	Computer science student interested in AI and machine learning.	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	2025-11-04 13:38:06.329+07	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.529+07	2025-11-04 13:38:06.329+07	\N	STU2024002	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000011	pending@example.com	pending	$2b$12$r5hDGrV/mbj6K/xGvMd5/.C7WFB2KbpaD60GUdzwNVv7rli0t.Lwm	Pending	User	\N	\N	\N	student	pending	t	\N	\N	\N	\N	f	\N	\N	\N	0	\N	1	\N	\N	\N	\N	2025-11-03 02:56:57.536+07	2025-11-03 02:56:57.536+07	\N	STU2024011	CNTT-K19	Computer Science	2024	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000006	student1@example.com	student1	$2b$12$WfR59yTtyXEW74PQB9yjtOG3UDN1UsSijS/y5bk98/jLIGf7pKjrO	Alice	Brown	\N	\N	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	2025-11-04 14:00:55.827+07	0	\N	1	\N	\N	\N	\N	2025-11-03 23:42:45.525774+07	2025-11-04 14:00:55.828+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20000000-0000-0000-0000-000000000011	student11@example.com	student11	$2b$12$IlNMm639EEo9n1hyloL2JeSAhAh96u1jW6oChs8yhGAuD9r4xX0nu	Student	Eleven	\N	\N	\N	student	active	t	\N	\N	\N	\N	f	\N	\N	2025-11-24 23:21:54.844+07	0	\N	2	\N	\N	\N	\N	2025-11-03 10:16:50.332+07	2025-11-24 23:23:42.681+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
764e6595-d381-4278-bfea-23899ad5f3f7	nlpt4fromwithnsp2909@gmail.com	phucdeptrai	$2b$12$S5q5hAErgCtu0KdLLeAvYODsJ.EvDzC1KwwvNHt7xah3At3HO0XI6	Phúc	Nguyễn	\N	\N	\N	student	active	f	\N	\N	\N	\N	f	\N	\N	\N	0	\N	2	\N	\N	{}	{}	2025-11-24 23:45:54.622+07	2025-11-24 23:46:04.976+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000002	admin@example.com	admin	$2b$12$R3NpC320blNzOp5Gzx9Aze1rueAZ24fu9FXRAY9vTpGazmrZJxkkK	System	Admin	\N	\N	\N	admin	active	t	\N	\N	\N	\N	f	\N	\N	2025-11-25 00:59:45.078+07	0	\N	3	\N	\N	\N	\N	2025-11-03 23:42:46.063695+07	2025-11-25 00:59:45.079+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
00000000-0000-0000-0000-000000000003	instructor1@example.com	instructor1	$2b$12$AGnLcMEhkUl5ah9Wg92TTukKF/6c32ZZdkaxRUYWoUDGcVc7hluUy	John	Doe	\N	\N	\N	instructor	active	t	\N	\N	\N	\N	f	\N	\N	2025-11-25 01:01:20.738+07	0	\N	2	\N	\N	\N	\N	2025-11-03 23:42:44.97817+07	2025-11-25 01:01:20.738+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.migrations_id_seq', 11, true);


--
-- Name: seeders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.seeders_id_seq', 1, false);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: course_statistics course_statistics_course_id_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_statistics
    ADD CONSTRAINT course_statistics_course_id_key UNIQUE (course_id);


--
-- Name: course_statistics course_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_statistics
    ADD CONSTRAINT course_statistics_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: final_grades final_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.final_grades
    ADD CONSTRAINT final_grades_pkey PRIMARY KEY (id);


--
-- Name: grade_components grade_components_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grade_components
    ADD CONSTRAINT grade_components_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: lesson_materials lesson_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_materials
    ADD CONSTRAINT lesson_materials_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: live_session_attendance live_session_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_session_attendance
    ADD CONSTRAINT live_session_attendance_pkey PRIMARY KEY (id);


--
-- Name: live_sessions live_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_sessions
    ADD CONSTRAINT live_sessions_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_version_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_version_key UNIQUE (version);


--
-- Name: notification_recipients notification_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: quiz_answers quiz_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: quiz_options quiz_options_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: seeders seeders_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.seeders
    ADD CONSTRAINT seeders_pkey PRIMARY KEY (id);


--
-- Name: seeders seeders_version_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.seeders
    ADD CONSTRAINT seeders_version_key UNIQUE (version);


--
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_instructor_id_unique; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_instructor_id_unique UNIQUE (instructor_id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_social_id_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_social_id_key UNIQUE (social_id);


--
-- Name: users users_student_id_unique; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_student_id_unique UNIQUE (student_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: assignment_submissions_assignment_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX assignment_submissions_assignment_id ON public.assignment_submissions USING btree (assignment_id);


--
-- Name: assignment_submissions_assignment_id_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX assignment_submissions_assignment_id_user_id ON public.assignment_submissions USING btree (assignment_id, user_id);


--
-- Name: assignment_submissions_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX assignment_submissions_user_id ON public.assignment_submissions USING btree (user_id);


--
-- Name: assignments_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX assignments_course_id ON public.assignments USING btree (course_id);


--
-- Name: assignments_due_date; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX assignments_due_date ON public.assignments USING btree (due_date);


--
-- Name: categories_is_active; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX categories_is_active ON public.categories USING btree (is_active);


--
-- Name: categories_order_index; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX categories_order_index ON public.categories USING btree (order_index);


--
-- Name: categories_parent_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX categories_parent_id ON public.categories USING btree (parent_id);


--
-- Name: categories_slug; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX categories_slug ON public.categories USING btree (slug);


--
-- Name: course_statistics_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX course_statistics_course_id ON public.course_statistics USING btree (course_id);


--
-- Name: courses_category_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX courses_category_id ON public.courses USING btree (category_id);


--
-- Name: enrollments_user_id_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX enrollments_user_id_course_id ON public.enrollments USING btree (user_id, course_id);


--
-- Name: final_grades_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX final_grades_course_id ON public.final_grades USING btree (course_id);


--
-- Name: final_grades_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX final_grades_user_id ON public.final_grades USING btree (user_id);


--
-- Name: final_grades_user_id_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX final_grades_user_id_course_id ON public.final_grades USING btree (user_id, course_id);


--
-- Name: grade_components_component_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX grade_components_component_type ON public.grade_components USING btree (component_type);


--
-- Name: grade_components_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX grade_components_course_id ON public.grade_components USING btree (course_id);


--
-- Name: grades_component_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX grades_component_id ON public.grades USING btree (component_id);


--
-- Name: grades_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX grades_course_id ON public.grades USING btree (course_id);


--
-- Name: grades_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX grades_user_id ON public.grades USING btree (user_id);


--
-- Name: idx_chat_messages_course_active; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_course_active ON public.chat_messages USING btree (course_id, is_deleted, created_at);


--
-- Name: idx_chat_messages_course_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_course_created_at ON public.chat_messages USING btree (course_id, created_at);


--
-- Name: idx_chat_messages_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_course_id ON public.chat_messages USING btree (course_id);


--
-- Name: idx_chat_messages_course_pinned; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_course_pinned ON public.chat_messages USING btree (course_id, is_pinned, created_at);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_messages_is_deleted; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_is_deleted ON public.chat_messages USING btree (is_deleted);


--
-- Name: idx_chat_messages_is_edited; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_is_edited ON public.chat_messages USING btree (is_edited);


--
-- Name: idx_chat_messages_is_pinned; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_is_pinned ON public.chat_messages USING btree (is_pinned);


--
-- Name: idx_chat_messages_message_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_message_type ON public.chat_messages USING btree (message_type);


--
-- Name: idx_chat_messages_reply_to_message_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_reply_to_message_id ON public.chat_messages USING btree (reply_to_message_id);


--
-- Name: idx_chat_messages_updated_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_updated_at ON public.chat_messages USING btree (updated_at);


--
-- Name: idx_chat_messages_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages USING btree (user_id);


--
-- Name: idx_courses_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_created_at ON public.courses USING btree (created_at);


--
-- Name: idx_courses_featured; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_featured ON public.courses USING btree (is_featured, status, rating);


--
-- Name: idx_courses_instructor_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_instructor_id ON public.courses USING btree (instructor_id);


--
-- Name: idx_courses_is_featured; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_is_featured ON public.courses USING btree (is_featured);


--
-- Name: idx_courses_is_free; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_is_free ON public.courses USING btree (is_free);


--
-- Name: idx_courses_language; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_language ON public.courses USING btree (language);


--
-- Name: idx_courses_level; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_level ON public.courses USING btree (level);


--
-- Name: idx_courses_price; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_price ON public.courses USING btree (price);


--
-- Name: idx_courses_published_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_published_at ON public.courses USING btree (published_at);


--
-- Name: idx_courses_rating; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_rating ON public.courses USING btree (rating);


--
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- Name: idx_enrollments_certificate_issued; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_certificate_issued ON public.enrollments USING btree (certificate_issued);


--
-- Name: idx_enrollments_completion_date; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_completion_date ON public.enrollments USING btree (completion_date);


--
-- Name: idx_enrollments_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_course_id ON public.enrollments USING btree (course_id);


--
-- Name: idx_enrollments_course_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_course_status ON public.enrollments USING btree (course_id, status);


--
-- Name: idx_enrollments_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_created_at ON public.enrollments USING btree (created_at);


--
-- Name: idx_enrollments_enrollment_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_enrollment_type ON public.enrollments USING btree (enrollment_type);


--
-- Name: idx_enrollments_last_accessed_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_last_accessed_at ON public.enrollments USING btree (last_accessed_at);


--
-- Name: idx_enrollments_payment_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_payment_status ON public.enrollments USING btree (payment_status);


--
-- Name: idx_enrollments_progress_percentage; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_progress_percentage ON public.enrollments USING btree (progress_percentage);


--
-- Name: idx_enrollments_rating; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_rating ON public.enrollments USING btree (rating);


--
-- Name: idx_enrollments_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_status ON public.enrollments USING btree (status);


--
-- Name: idx_enrollments_user_course_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX idx_enrollments_user_course_status ON public.enrollments USING btree (user_id, course_id, status);


--
-- Name: idx_enrollments_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_user_id ON public.enrollments USING btree (user_id);


--
-- Name: idx_enrollments_user_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_enrollments_user_status ON public.enrollments USING btree (user_id, status);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_email_verification_token; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_email_verification_token ON public.users USING btree (email_verification_token);


--
-- Name: idx_users_email_verified_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_email_verified_at ON public.users USING btree (email_verified_at);


--
-- Name: idx_users_last_login; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_last_login ON public.users USING btree (last_login);


--
-- Name: idx_users_password_reset_token; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_password_reset_token ON public.users USING btree (password_reset_token);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_social_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX idx_users_social_id ON public.users USING btree (social_id);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: lesson_materials_file_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_materials_file_type ON public.lesson_materials USING btree (file_type);


--
-- Name: lesson_materials_lesson_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_materials_lesson_id ON public.lesson_materials USING btree (lesson_id);


--
-- Name: lesson_materials_uploaded_by; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_materials_uploaded_by ON public.lesson_materials USING btree (uploaded_by);


--
-- Name: lesson_progress_completed; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_progress_completed ON public.lesson_progress USING btree (completed);


--
-- Name: lesson_progress_last_accessed_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_progress_last_accessed_at ON public.lesson_progress USING btree (last_accessed_at);


--
-- Name: lesson_progress_lesson_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_progress_lesson_id ON public.lesson_progress USING btree (lesson_id);


--
-- Name: lesson_progress_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lesson_progress_user_id ON public.lesson_progress USING btree (user_id);


--
-- Name: lessons_content_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lessons_content_type ON public.lessons USING btree (content_type);


--
-- Name: lessons_section_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lessons_section_id ON public.lessons USING btree (section_id);


--
-- Name: lessons_section_id_order_index; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX lessons_section_id_order_index ON public.lessons USING btree (section_id, order_index);


--
-- Name: live_session_attendance_session_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_session_attendance_session_id ON public.live_session_attendance USING btree (session_id);


--
-- Name: live_session_attendance_session_id_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX live_session_attendance_session_id_user_id ON public.live_session_attendance USING btree (session_id, user_id);


--
-- Name: live_session_attendance_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_session_attendance_user_id ON public.live_session_attendance USING btree (user_id);


--
-- Name: live_sessions_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_sessions_course_id ON public.live_sessions USING btree (course_id);


--
-- Name: live_sessions_instructor_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_sessions_instructor_id ON public.live_sessions USING btree (instructor_id);


--
-- Name: live_sessions_scheduled_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_sessions_scheduled_at ON public.live_sessions USING btree (scheduled_at);


--
-- Name: live_sessions_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX live_sessions_status ON public.live_sessions USING btree (status);


--
-- Name: notification_recipients_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notification_recipients_created_at ON public.notification_recipients USING btree (created_at);


--
-- Name: notification_recipients_is_read; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notification_recipients_is_read ON public.notification_recipients USING btree (is_read);


--
-- Name: notification_recipients_notification_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notification_recipients_notification_id ON public.notification_recipients USING btree (notification_id);


--
-- Name: notification_recipients_recipient_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notification_recipients_recipient_id ON public.notification_recipients USING btree (recipient_id);


--
-- Name: notifications_category; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_category ON public.notifications USING btree (category);


--
-- Name: notifications_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: notifications_notification_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_notification_type ON public.notifications USING btree (notification_type);


--
-- Name: notifications_priority; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_priority ON public.notifications USING btree (priority);


--
-- Name: notifications_related_resource_type_related_resource_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_related_resource_type_related_resource_id ON public.notifications USING btree (related_resource_type, related_resource_id);


--
-- Name: notifications_scheduled_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_scheduled_at ON public.notifications USING btree (scheduled_at);


--
-- Name: notifications_sender_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_sender_id ON public.notifications USING btree (sender_id);


--
-- Name: notifications_sent_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX notifications_sent_at ON public.notifications USING btree (sent_at);


--
-- Name: password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: password_reset_tokens_token; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- Name: password_reset_tokens_token_used_expires_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX password_reset_tokens_token_used_expires_at ON public.password_reset_tokens USING btree (token, used, expires_at);


--
-- Name: password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- Name: quiz_answers_attempt_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quiz_answers_attempt_id ON public.quiz_answers USING btree (attempt_id);


--
-- Name: quiz_answers_attempt_id_question_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX quiz_answers_attempt_id_question_id ON public.quiz_answers USING btree (attempt_id, question_id);


--
-- Name: quiz_attempts_quiz_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quiz_attempts_quiz_id ON public.quiz_attempts USING btree (quiz_id);


--
-- Name: quiz_attempts_quiz_id_user_id_attempt_number; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX quiz_attempts_quiz_id_user_id_attempt_number ON public.quiz_attempts USING btree (quiz_id, user_id, attempt_number);


--
-- Name: quiz_attempts_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quiz_attempts_user_id ON public.quiz_attempts USING btree (user_id);


--
-- Name: quiz_options_question_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quiz_options_question_id ON public.quiz_options USING btree (question_id);


--
-- Name: quiz_questions_quiz_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quiz_questions_quiz_id ON public.quiz_questions USING btree (quiz_id);


--
-- Name: quiz_questions_quiz_id_order_index; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX quiz_questions_quiz_id_order_index ON public.quiz_questions USING btree (quiz_id, order_index);


--
-- Name: quizzes_available_from; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quizzes_available_from ON public.quizzes USING btree (available_from);


--
-- Name: quizzes_available_until; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quizzes_available_until ON public.quizzes USING btree (available_until);


--
-- Name: quizzes_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX quizzes_course_id ON public.quizzes USING btree (course_id);


--
-- Name: recipient_active_unread; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX recipient_active_unread ON public.notification_recipients USING btree (recipient_id, is_read, is_archived);


--
-- Name: recipient_read_status; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX recipient_read_status ON public.notification_recipients USING btree (recipient_id, is_read);


--
-- Name: sections_course_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX sections_course_id ON public.sections USING btree (course_id);


--
-- Name: sections_course_id_order_index; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX sections_course_id_order_index ON public.sections USING btree (course_id, order_index);


--
-- Name: unique_lesson_order_per_section; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX unique_lesson_order_per_section ON public.lessons USING btree (section_id, order_index);


--
-- Name: unique_notification_recipient; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX unique_notification_recipient ON public.notification_recipients USING btree (notification_id, recipient_id);


--
-- Name: unique_section_order_per_course; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX unique_section_order_per_course ON public.sections USING btree (course_id, order_index);


--
-- Name: unique_user_lesson_progress; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX unique_user_lesson_progress ON public.lesson_progress USING btree (user_id, lesson_id);


--
-- Name: user_activity_logs_activity_type; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX user_activity_logs_activity_type ON public.user_activity_logs USING btree (activity_type);


--
-- Name: user_activity_logs_created_at; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX user_activity_logs_created_at ON public.user_activity_logs USING btree (created_at);


--
-- Name: user_activity_logs_user_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX user_activity_logs_user_id ON public.user_activity_logs USING btree (user_id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: assignment_submissions assignment_submissions_graded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.users(id);


--
-- Name: assignment_submissions assignment_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_pinned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_reply_to_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_reply_to_message_id_fkey FOREIGN KEY (reply_to_message_id) REFERENCES public.chat_messages(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: course_statistics course_statistics_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_statistics
    ADD CONSTRAINT course_statistics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: final_grades final_grades_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.final_grades
    ADD CONSTRAINT final_grades_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: final_grades final_grades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.final_grades
    ADD CONSTRAINT final_grades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grade_components grade_components_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grade_components
    ADD CONSTRAINT grade_components_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: grades grades_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.grade_components(id) ON DELETE CASCADE;


--
-- Name: grades grades_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: grades grades_graded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.users(id);


--
-- Name: grades grades_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lesson_materials lesson_materials_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_materials
    ADD CONSTRAINT lesson_materials_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_materials lesson_materials_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_materials
    ADD CONSTRAINT lesson_materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- Name: live_session_attendance live_session_attendance_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_session_attendance
    ADD CONSTRAINT live_session_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.live_sessions(id) ON DELETE CASCADE;


--
-- Name: live_session_attendance live_session_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_session_attendance
    ADD CONSTRAINT live_session_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: live_sessions live_sessions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_sessions
    ADD CONSTRAINT live_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: live_sessions live_sessions_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.live_sessions
    ADD CONSTRAINT live_sessions_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id);


--
-- Name: notification_recipients notification_recipients_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: notification_recipients notification_recipients_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quiz_answers quiz_answers_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(id) ON DELETE CASCADE;


--
-- Name: quiz_answers quiz_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- Name: quiz_answers quiz_answers_selected_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.quiz_options(id);


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quiz_options quiz_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_options
    ADD CONSTRAINT quiz_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: sections sections_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: lms_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict MuQddh2q21XgJaYp4teUaIMbNVKS9CSvGGGrqLcOENvXXOHNYc9h2sQhxH5pAlO

