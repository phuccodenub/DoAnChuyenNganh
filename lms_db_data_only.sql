pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: chat_messages
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: categories
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
--
-- PostgreSQL database dump
--

\restrict k2aY8cGxoXJFMlRo1N4uiLPrM3EjsHXGw4ucFiPG1VchWeCpxzw2FTgol3gjMUw

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
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public."SequelizeMeta" VALUES ('20251019000000-add-email-verified-at-column.js');
INSERT INTO public."SequelizeMeta" VALUES ('20251012031022-add-unique-constraints-to-user-ids.js');
INSERT INTO public."SequelizeMeta" VALUES ('20251021214245-cleanup-course-categories.js');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000001', 'Web Development', 'web-development', 'Web Development related courses', NULL, '≡ƒÆ╗', '#3B82F6', 1, true, 0, '{}', '2025-11-04 13:17:11.667817+07', '2025-11-04 13:17:11.667817+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000002', 'Data Science', 'data-science', 'Data Science and ML', NULL, '≡ƒôè', '#10B981', 2, true, 0, '{}', '2025-11-04 13:17:11.679094+07', '2025-11-04 13:17:11.679094+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000003', 'Programming', 'programming', 'General programming', NULL, '≡ƒºá', '#6366F1', 3, true, 0, '{}', '2025-11-04 13:17:11.681518+07', '2025-11-04 13:17:11.681518+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000004', 'Design', 'design', 'UI/UX and design', NULL, '≡ƒÄ¿', '#F59E0B', 4, true, 0, '{}', '2025-11-04 13:17:11.684305+07', '2025-11-04 13:17:11.684305+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000005', 'Business', 'business', 'Business and marketing', NULL, '≡ƒôê', '#EF4444', 5, true, 0, '{}', '2025-11-04 13:17:11.687038+07', '2025-11-04 13:17:11.687038+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000101', 'Frontend', 'frontend', NULL, '10000000-0000-0000-0000-000000000001', NULL, NULL, 0, true, 0, '{}', '2025-11-04 13:17:11.692359+07', '2025-11-04 13:17:11.692359+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000102', 'Backend', 'backend', NULL, '10000000-0000-0000-0000-000000000001', NULL, NULL, 0, true, 0, '{}', '2025-11-04 13:17:11.696993+07', '2025-11-04 13:17:11.696993+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000103', 'Full Stack', 'full-stack', NULL, '10000000-0000-0000-0000-000000000001', NULL, NULL, 0, true, 0, '{}', '2025-11-04 13:17:11.699607+07', '2025-11-04 13:17:11.699607+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000201', 'Machine Learning', 'machine-learning', NULL, '10000000-0000-0000-0000-000000000002', NULL, NULL, 0, true, 0, '{}', '2025-11-04 13:17:11.702359+07', '2025-11-04 13:17:11.702359+07');
INSERT INTO public.categories VALUES ('10000000-0000-0000-0000-000000000301', 'JavaScript', 'javascript', NULL, '10000000-0000-0000-0000-000000000003', NULL, NULL, 0, true, 0, '{}', '2025-11-04 13:17:11.70542+07', '2025-11-04 13:17:11.70542+07');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000004', 'instructor2@example.com', 'instructor2', '$2b$12$PlUIvWpPRQwKtmNTBrnaYuZPNhC7MDQlfKsVv2rWDq/3cY0xFANwi', 'Jane', 'Smith', '+84901000004', 'Full-stack developer and educator. Passionate about teaching modern JavaScript frameworks.', NULL, 'instructor', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.524+07', '2025-11-03 02:56:57.524+07', NULL, NULL, NULL, NULL, NULL, NULL, 'INS002', 'Computer Science', 'Full-Stack Development, JavaScript', 8, 'master', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000005', 'instructor3@example.com', 'instructor3', '$2b$12$E4vl.GbHBMVKroXRAn4NnuSxSYVlubK9DsUTgG5MgVkouSQXW5YXm', 'Mike', 'Johnson', '+84901000005', 'Data scientist and machine learning expert with Ph.D. in Computer Science.', NULL, 'instructor', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.525+07', '2025-11-03 02:56:57.525+07', NULL, NULL, NULL, NULL, NULL, NULL, 'INS003', 'Computer Science', 'Machine Learning, Data Science, AI', 12, 'phd', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000001', 'superadmin@example.com', 'superadmin', '$2b$12$E7F2ajMXVrv8bemKoBVLqOp3Ey7.4W.SQuKBWmcfCMCyPZQgEY4rS', 'Super', 'Admin', '+84901000001', 'System Super Administrator', NULL, 'admin', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.506+07', '2025-11-03 10:23:10.514+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000008', 'student3@example.com', 'student3', '$2b$12$WEQjgulKyMyOiLkgiZO7uODROiCJnVgooLireeaxsYZtY81tzRMuO', 'Carol', 'Davis', '+84901000008', 'Frontend developer learning advanced React patterns.', NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.53+07', '2025-11-03 02:56:57.53+07', NULL, 'STU2024003', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000009', 'student4@example.com', 'student4', '$2b$12$EcEf77il/vnwGmfac9pVI.UNsPYIwSECEYOvyDePZdQIgJb6Sg5Jy', 'David', 'Miller', '+84901000009', 'Backend developer learning Node.js and databases.', NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.532+07', '2025-11-03 02:56:57.532+07', NULL, 'STU2024004', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000010', 'student5@example.com', 'student5', '$2b$12$ZUZLJ87S5zhrM955CQ7GaOrWKf6ZK.SBLSYwEu.e2p232i5EYzscu', 'Eva', 'Garcia', '+84901000010', 'Mobile developer learning React Native.', NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.534+07', '2025-11-03 02:56:57.534+07', NULL, 'STU2024005', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000012', 'suspended@example.com', 'suspended', '$2b$12$2J25hPPuGMe8cZSXz1fyw.acTxL9gVXXs2CZfB8ZMQ4fsLtrO4bZq', 'Suspended', 'User', NULL, NULL, NULL, 'student', 'suspended', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.537+07', '2025-11-03 02:56:57.537+07', NULL, 'STU2024012', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('20000000-0000-0000-0000-000000000011', 'student11@example.com', 'student11', '$2b$12$IlNMm639EEo9n1hyloL2JeSAhAh96u1jW6oChs8yhGAuD9r4xX0nu', 'Student', 'Eleven', NULL, NULL, NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 10:16:50.332+07', '2025-11-03 10:23:11.038+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('20000000-0000-0000-0000-000000000021', 'instructor@example.com', 'instructor', '$2b$12$6x3zap1PEpWxTLT7MUeM9uegi/gqqzkIvORf8I8pQ.HNZz00ghNz6', 'John', 'Instructor', NULL, NULL, NULL, 'instructor', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 10:16:50.599+07', '2025-11-03 10:23:11.288+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000003', 'instructor1@example.com', 'instructor1', '$2b$12$AGnLcMEhkUl5ah9Wg92TTukKF/6c32ZZdkaxRUYWoUDGcVc7hluUy', 'John', 'Doe', NULL, NULL, NULL, 'instructor', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 23:42:44.97817+07', '2025-11-03 23:42:44.97817+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000002', 'admin@example.com', 'admin', '$2b$12$R3NpC320blNzOp5Gzx9Aze1rueAZ24fu9FXRAY9vTpGazmrZJxkkK', 'System', 'Admin', NULL, NULL, NULL, 'admin', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, '2025-11-04 04:40:38.174+07', 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 23:42:46.063695+07', '2025-11-04 04:40:38.174+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000007', 'student2@example.com', 'student2', '$2b$12$R3NpC320blNzOp5Gzx9Aze1rueAZ24fu9FXRAY9vTpGazmrZJxkkK', 'Bob', 'Wilson', '+84901000007', 'Computer science student interested in AI and machine learning.', NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, '2025-11-04 13:38:06.329+07', 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.529+07', '2025-11-04 13:38:06.329+07', NULL, 'STU2024002', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000011', 'pending@example.com', 'pending', '$2b$12$r5hDGrV/mbj6K/xGvMd5/.C7WFB2KbpaD60GUdzwNVv7rli0t.Lwm', 'Pending', 'User', NULL, NULL, NULL, 'student', 'pending', true, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.536+07', '2025-11-03 02:56:57.536+07', NULL, 'STU2024011', 'CNTT-K19', 'Computer Science', 2024, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users VALUES ('00000000-0000-0000-0000-000000000006', 'student1@example.com', 'student1', '$2b$12$WfR59yTtyXEW74PQB9yjtOG3UDN1UsSijS/y5bk98/jLIGf7pKjrO', 'Alice', 'Brown', NULL, NULL, NULL, 'student', 'active', true, NULL, NULL, NULL, NULL, false, NULL, NULL, '2025-11-04 14:00:55.827+07', 0, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-03 23:42:45.525774+07', '2025-11-04 14:00:55.828+07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.courses VALUES ('10000000-0000-0000-0000-000000000002', 'Advanced React Development', 'Master React hooks, context API, and advanced patterns.', NULL, '00000000-0000-0000-0000-000000000004', 'advanced', 'en', 49.99, 'USD', NULL, NULL, NULL, NULL, 'https://via.placeholder.com/400x300?text=Advanced+React', NULL, 60, 0, 0, 0.00, 0, 'published', true, false, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.563+07', '2025-11-03 02:56:57.563+07', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.courses VALUES ('10000000-0000-0000-0000-000000000003', 'Machine Learning with Python', 'Introduction to machine learning concepts using Python and scikit-learn.', NULL, '00000000-0000-0000-0000-000000000005', 'intermediate', 'en', 79.99, 'USD', NULL, NULL, NULL, NULL, 'https://via.placeholder.com/400x300?text=ML+Python', NULL, 80, 0, 0, 0.00, 0, 'published', false, false, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.565+07', '2025-11-03 02:56:57.565+07', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.courses VALUES ('10000000-0000-0000-0000-000000000005', 'Full-Stack JavaScript', 'Complete full-stack course covering React, Node.js, and MongoDB.', NULL, '00000000-0000-0000-0000-000000000004', 'intermediate', 'en', 99.99, 'USD', NULL, NULL, NULL, NULL, 'https://via.placeholder.com/400x300?text=Full-Stack+JS', NULL, 120, 0, 0, 0.00, 0, 'published', true, false, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.569+07', '2025-11-03 02:56:57.569+07', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.courses VALUES ('10000000-0000-0000-0000-000000000001', 'Web Development Fundamentals', 'Learn the basics of HTML, CSS, and JavaScript. Perfect for beginners.', NULL, '00000000-0000-0000-0000-000000000003', 'beginner', 'en', 0.00, 'USD', NULL, NULL, NULL, NULL, 'https://via.placeholder.com/400x300?text=Web+Dev+Fundamentals', NULL, 40, 0, 0, 0.00, 0, 'published', true, false, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.263+07', '2025-11-04 01:37:56.263+07', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.courses VALUES ('10000000-0000-0000-0000-000000000004', 'Node.js Backend Development', 'Build scalable backend APIs with Node.js, Express, and PostgreSQL.', NULL, '00000000-0000-0000-0000-000000000003', 'intermediate', 'en', 59.99, 'USD', NULL, NULL, NULL, NULL, 'https://via.placeholder.com/400x300?text=Node.js+Backend', NULL, 50, 0, 0, 0.00, 0, 'published', false, false, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.314+07', '2025-11-04 01:37:56.314+07', '10000000-0000-0000-0000-000000000001');
INSERT INTO public.courses VALUES ('20000000-0000-0000-0000-000000000001', 'Introduction to React Development', 'Learn React fundamentals: components, hooks, state.

This comprehensive course will take you from React basics to building real-world applications. You''ll learn:

ΓÇó Core React concepts and component architecture
ΓÇó Modern hooks (useState, useEffect, useContext, etc.)
ΓÇó State management and data flow
ΓÇó Building reusable components
ΓÇó Working with forms and events
ΓÇó API integration and async operations
ΓÇó Routing with React Router
ΓÇó Best practices and common patterns

Perfect for beginners with basic JavaScript knowledge who want to master React development.', 'Learn React fundamentals: components, hooks, state.', '00000000-0000-0000-0000-000000000003', 'beginner', 'vi', 0.00, 'USD', NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 'https://www.youtube.com/watch?v=SqcY0GlETPk', 30, 8, 23, 4.50, 18, 'published', true, true, '["Basic HTML/CSS knowledge","JavaScript fundamentals","ES6+ features understanding"]', '["Build modern React applications from scratch","Master React Hooks and component lifecycle","Implement state management effectively","Create reusable and maintainable components","Handle forms, events, and user interactions","Integrate APIs and handle async operations","Implement routing in React applications"]', '["React","JavaScript","Frontend","Web Development","Hooks"]', '{"difficulty_rating":"easy","completion_time":"4-6 weeks","certificate_available":true,"has_subtitles":true}', '2024-01-01 07:00:00+07', '2025-11-05 02:06:54.404+07', '2025-11-05 03:09:57.426+07', '10000000-0000-0000-0000-000000000001');


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.assignments VALUES ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'B├ái tß║¡p 1: Widgets c╞í bß║ún', 'H├úy nß╗Öp b├ái c├íc c├óu hß╗Åi d╞░ß╗¢i ─æ├óy PDF. Y├¬u cß║ºu: tß╗æi thiß╗âu 2 trang, m├┤ tß║ú tiß╗ün tß╗æ v├á v─ân ─æß╗ü gß║Ñp phß║úi.

Nß╗Öi dung b├ái tß║¡p:
1. X├óy dß╗▒ng m├án h├¼nh login vß╗¢i TextField v├á Button
2. Tß║ío danh s├ích sß║ún phß║⌐m vß╗¢i ListView
3. Implement navigation giß╗»a c├íc m├án h├¼nh
4. Sß╗¡ dß╗Ñng setState ─æß╗â quß║ún l├╜ form state

Y├¬u cß║ºu:
- Code phß║úi clean v├á c├│ comments
- UI phß║úi responsive
- Xß╗¡ l├╜ validation ─æß║ºu v├áo
- C├│ ├¡t nhß║Ñt 3 m├án h├¼nh', 40.00, '2025-11-07 04:23:00+07', true, 'both', true, '2025-11-05 02:06:54.524+07', '2025-11-05 03:09:57.481+07');
INSERT INTO public.assignments VALUES ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Quiz: State Management', 'Ho├án th├ánh b├ái quiz vß╗ü State Management.

Nß╗Öi dung:
- C├íc kh├íi niß╗çm c╞í bß║ún vß╗ü state
- Provider pattern
- setState vs setState callback
- Best practices

Thß╗¥i gian: 30 ph├║t
Sß╗æ c├óu hß╗Åi: 10
─Éiß╗âm tß╗æi ─æa: 5/40', 5.00, '2025-11-11 04:23:00+07', false, 'text', true, '2025-11-05 02:06:54.531+07', '2025-11-05 03:09:57.482+07');


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.assignment_submissions VALUES ('80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', '─É├óy l├á b├ái nß╗Öp cß╗ºa t├┤i. T├┤i ─æ├ú ho├án th├ánh tß║Ñt cß║ú c├íc y├¬u cß║ºu.', 'https://example.com/submissions/Huong_dan_nop_bai.pdf', 'Huong_dan_nop_bai.pdf', '2025-11-04 17:00:00+07', 12.00, 'B├ái l├ám tß╗æt! Tuy nhi├¬n cß║ºn ch├║ ├╜ h╞ín vß╗ü UI/UX.', '00000000-0000-0000-0000-000000000003', '2025-11-05 21:30:00+07', 'graded', '2025-11-05 02:07:29.955+07', '2025-11-05 03:09:57.484+07');


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: course_statistics; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.enrollments VALUES ('6f8afdf8-b5ab-4936-a67c-32692b1b1a52', '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.59+07', '2025-11-03 02:56:57.59+07');
INSERT INTO public.enrollments VALUES ('96c2ba36-7d28-49fa-abbf-18399db1df41', '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.593+07', '2025-11-03 02:56:57.593+07');
INSERT INTO public.enrollments VALUES ('83bf3476-150b-4d19-bbcc-c81ff5bcd246', '00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.595+07', '2025-11-03 02:56:57.595+07');
INSERT INTO public.enrollments VALUES ('46d8e23a-529f-4d0e-8a5f-170b2252eba3', '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 02:56:57.599+07', '2025-11-03 02:56:57.599+07');
INSERT INTO public.enrollments VALUES ('bbbc2c46-5c4f-441f-b46b-133e3b40d003', '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.321+07', '2025-11-04 01:37:56.321+07');
INSERT INTO public.enrollments VALUES ('b54c386e-7081-419f-90a8-1102fda690ff', '00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.353+07', '2025-11-04 01:37:56.353+07');
INSERT INTO public.enrollments VALUES ('5c95e099-f560-4f14-ae2b-447ecc3e7eb2', '00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'completed', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.359+07', '2025-11-04 01:37:56.359+07');
INSERT INTO public.enrollments VALUES ('2013c07d-7dfc-43ea-8d19-599e097b0baa', '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.364+07', '2025-11-04 01:37:56.364+07');
INSERT INTO public.enrollments VALUES ('5eba0883-cff8-48b6-b929-890a6336aa20', '00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'completed', 'free', 'pending', NULL, NULL, NULL, NULL, 0.00, 0, 0, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 01:37:56.367+07', '2025-11-04 01:37:56.367+07');
INSERT INTO public.enrollments VALUES ('a676b7b0-199d-4b37-85de-de05be2b8cb6', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'active', 'free', 'pending', NULL, NULL, NULL, NULL, 80.00, 6, 8, '2025-11-05 03:09:57.486+07', NULL, false, NULL, 5, 'Kh├│a hß╗ìc rß║Ñt hay v├á dß╗à hiß╗âu. Giß║úng vi├¬n tß║¡n t├óm!', '2025-11-05 02:07:29.967+07', NULL, NULL, '2025-11-05 02:07:29.967+07', '2025-11-05 03:09:57.486+07');


--
-- Data for Name: final_grades; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.final_grades VALUES ('c535bf23-ec42-42cb-aa65-166bff648ad4', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 83.00, 'B+', '2025-11-05 02:13:41.678+07', '2025-11-05 02:13:41.678+07', '2025-11-05 03:09:57.538+07');


--
-- Data for Name: grade_components; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.grade_components VALUES ('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'assignment', '60000000-0000-0000-0000-000000000001', 40.00, 'Assignments', '2025-11-05 02:13:41.653+07', '2025-11-05 03:09:57.514+07');
INSERT INTO public.grade_components VALUES ('a0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'quiz', '50000000-0000-0000-0000-000000000001', 30.00, 'Quizzes', '2025-11-05 02:13:41.661+07', '2025-11-05 03:09:57.515+07');
INSERT INTO public.grade_components VALUES ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'participation', NULL, 30.00, 'Participation', '2025-11-05 02:13:41.663+07', '2025-11-05 03:09:57.516+07');


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.grades VALUES ('b29d2c3c-7741-4255-b189-67f6d3117076', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 30.00, 40.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 02:13:41.664+07', 'L├ám b├ái tß╗æt, cß║ºn cß║úi thiß╗çn th├¬m', '2025-11-05 02:13:41.664+07', '2025-11-05 02:13:41.664+07');
INSERT INTO public.grades VALUES ('2039c1db-d7c3-4b5c-90e6-e3449f3182c9', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 25.00, 30.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 02:13:41.676+07', 'Hiß╗âu b├ái kh├í tß╗æt', '2025-11-05 02:13:41.676+07', '2025-11-05 02:13:41.676+07');
INSERT INTO public.grades VALUES ('6222cb96-9cf4-4c37-bca9-67d436913c38', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 28.00, 30.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 02:13:41.677+07', 'T├¡ch cß╗▒c tham gia', '2025-11-05 02:13:41.677+07', '2025-11-05 02:13:41.677+07');
INSERT INTO public.grades VALUES ('dbd4fe44-5159-4a95-884f-c877192377eb', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 30.00, 40.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 03:09:57.517+07', 'L├ám b├ái tß╗æt, cß║ºn cß║úi thiß╗çn th├¬m', '2025-11-05 03:09:57.517+07', '2025-11-05 03:09:57.517+07');
INSERT INTO public.grades VALUES ('6939c91c-05f1-4169-ae4c-57a6f52d0f20', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 25.00, 30.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 03:09:57.533+07', 'Hiß╗âu b├ái kh├í tß╗æt', '2025-11-05 03:09:57.533+07', '2025-11-05 03:09:57.533+07');
INSERT INTO public.grades VALUES ('e0c6e8b2-1870-4444-b62d-4b7feb8e4f11', '00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 28.00, 30.00, '00000000-0000-0000-0000-000000000003', '2025-11-05 03:09:57.536+07', 'T├¡ch cß╗▒c tham gia', '2025-11-05 03:09:57.536+07', '2025-11-05 03:09:57.536+07');


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.sections VALUES ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Ch╞░╞íng 1: Giß╗¢i thiß╗çu vß╗ü Flutter', 'T├¼m hiß╗âu c╞í bß║ún vß╗ü Flutter framework v├á m├┤i tr╞░ß╗¥ng ph├ít triß╗ân', 1, true, 180, '["Hiß╗âu Flutter l├á g├¼ v├á tß║íi sao n├¬n hß╗ìc","C├ái ─æß║╖t m├┤i tr╞░ß╗¥ng ph├ít triß╗ân","X├óy dß╗▒ng ß╗⌐ng dß╗Ñng Hello World ─æß║ºu ti├¬n"]', '2025-11-05 02:06:54.435+07', '2025-11-05 03:09:57.437+07');
INSERT INTO public.sections VALUES ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Ch╞░╞íng 2: Widgets c╞í bß║ún', 'Hß╗ìc vß╗ü c├íc widgets c╞í bß║ún trong Flutter', 2, true, 240, '["Hiß╗âu kh├íi niß╗çm Widget trong Flutter","Sß╗¡ dß╗Ñng StatelessWidget v├á StatefulWidget","X├óy dß╗▒ng giao diß╗çn vß╗¢i c├íc widgets phß╗ò biß║┐n"]', '2025-11-05 02:06:54.448+07', '2025-11-05 03:09:57.439+07');
INSERT INTO public.sections VALUES ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Ch╞░╞íng 3: Navigation v├á Routing', 'T├¼m hiß╗âu vß╗ü ─æiß╗üu h╞░ß╗¢ng giß╗»a c├íc m├án h├¼nh', 3, true, 200, '["─Éiß╗üu h╞░ß╗¢ng c╞í bß║ún vß╗¢i Navigator","Named routes v├á route parameters","Advanced navigation patterns"]', '2025-11-05 02:06:54.451+07', '2025-11-05 03:09:57.441+07');


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'B├ái 1: Flutter l├á g├¼ v├á tß║íi sao n├¬n hß╗ìc?', 'Giß╗¢i thiß╗çu tß╗òng quan vß╗ü Flutter framework v├á lß╗úi ├¡ch cß╗ºa viß╗çc sß╗¡ dß╗Ñng Flutter', 'video', '<h2>Flutter l├á g├¼?</h2>
<p>Flutter l├á mß╗Öt framework m├ú nguß╗ôn mß╗ƒ ─æ╞░ß╗úc ph├ít triß╗ân bß╗ƒi Google ─æß╗â x├óy dß╗▒ng ß╗⌐ng dß╗Ñng ─æa nß╗ün tß║úng.</p>

<h3>╞»u ─æiß╗âm cß╗ºa Flutter:</h3>
<ul>
  <li>Hot Reload - Cß║¡p nhß║¡t code ngay lß║¡p tß╗⌐c</li>
  <li>UI ─æß║╣p v├á m╞░ß╗út m├á</li>
  <li>Hiß╗çu suß║Ñt cao gß║ºn native</li>
  <li>Mß╗Öt codebase cho nhiß╗üu platform</li>
</ul>', 'https://www.youtube.com/watch?v=1xipg02Wu8s', 900, 1, 30, true, true, '{}', '{}', '2025-11-05 02:06:54.455+07', '2025-11-05 03:09:57.443+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'B├ái 2: H╞░ß╗¢ng dß║½n c├ái ─æß║╖t m├┤i tr╞░ß╗¥ng', 'C├ái ─æß║╖t Flutter SDK, Android Studio, v├á c├íc c├┤ng cß╗Ñ cß║ºn thiß║┐t', 'document', '<h2>C├ái ─æß║╖t Flutter</h2>
<ol>
  <li>Tß║úi Flutter SDK tß╗½ trang ch├¡nh thß╗⌐c</li>
  <li>Giß║úi n├⌐n v├á th├¬m v├áo PATH</li>
  <li>Chß║íy flutter doctor ─æß╗â kiß╗âm tra</li>
  <li>C├ái ─æß║╖t Android Studio hoß║╖c VS Code</li>
  <li>C├ái ─æß║╖t Flutter plugin</li>
</ol>

<h3>Y├¬u cß║ºu hß╗ç thß╗æng:</h3>
<ul>
  <li>Windows 10 trß╗ƒ l├¬n / macOS / Linux</li>
  <li>├ìt nhß║Ñt 8GB RAM</li>
  <li>10GB dung l╞░ß╗úng trß╗æng</li>
</ul>', NULL, NULL, 2, 45, true, true, '{}', '{}', '2025-11-05 02:06:54.46+07', '2025-11-05 03:09:57.445+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'B├ái 3: X├óy dß╗▒ng ß╗⌐ng dß╗Ñng "Hello World"', 'Tß║ío ß╗⌐ng dß╗Ñng Flutter ─æß║ºu ti├¬n v├á hiß╗âu cß║Ñu tr├║c project', 'video', '<h2>Hello World App</h2>
<p>Trong b├ái n├áy, ch├║ng ta sß║╜ x├óy dß╗▒ng ß╗⌐ng dß╗Ñng Flutter ─æß║ºu ti├¬n.</p>

<h3>C├íc b╞░ß╗¢c thß╗▒c hiß╗çn:</h3>
<ol>
  <li>Tß║ío project mß╗¢i vß╗¢i flutter create</li>
  <li>Hiß╗âu cß║Ñu tr├║c th╞░ mß╗Ñc</li>
  <li>Chß╗ënh sß╗¡a file main.dart</li>
  <li>Chß║íy ß╗⌐ng dß╗Ñng tr├¬n emulator</li>
</ol>', 'https://www.youtube.com/watch?v=xWV71C2kp38', 1200, 3, 60, true, false, '{}', '{}', '2025-11-05 02:06:54.463+07', '2025-11-05 03:09:57.447+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'B├ái 1: StatelessWidget v├á StatefulWidget', 'T├¼m hiß╗âu sß╗▒ kh├íc biß╗çt giß╗»a StatelessWidget v├á StatefulWidget', 'video', '<h2>Widgets trong Flutter</h2>
<p>Widget l├á th├ánh phß║ºn c╞í bß║ún nhß║Ñt trong Flutter. Mß╗ìi thß╗⌐ ─æß╗üu l├á widget!</p>

<h3>StatelessWidget:</h3>
<ul>
  <li>Kh├┤ng thay ─æß╗òi trß║íng th├íi</li>
  <li>Render mß╗Öt lß║ºn</li>
  <li>D├╣ng cho UI t─⌐nh</li>
</ul>

<h3>StatefulWidget:</h3>
<ul>
  <li>C├│ thß╗â thay ─æß╗òi trß║íng th├íi</li>
  <li>Re-render khi state thay ─æß╗òi</li>
  <li>D├╣ng cho UI ─æß╗Öng</li>
</ul>', 'https://www.youtube.com/watch?v=p5dkB3Mrxdo', 1500, 1, 50, true, false, '{}', '{}', '2025-11-05 02:06:54.465+07', '2025-11-05 03:09:57.448+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'B├ái 2: Layout Widgets (Container, Row, Column)', 'Hß╗ìc c├ích sß║»p xß║┐p layout vß╗¢i Container, Row, Column', 'video', '<h2>Layout Widgets</h2>
<p>Flutter cung cß║Ñp nhiß╗üu widget ─æß╗â x├óy dß╗▒ng layout phß╗⌐c tß║íp.</p>

<h3>Container:</h3>
<ul>
  <li>Widget ─æa n─âng nhß║Ñt</li>
  <li>Padding, margin, decoration</li>
  <li>C├│ thß╗â chß╗⌐a widget con</li>
</ul>

<h3>Row & Column:</h3>
<ul>
  <li>Row: Sß║»p xß║┐p ngang</li>
  <li>Column: Sß║»p xß║┐p dß╗ìc</li>
  <li>MainAxis v├á CrossAxis</li>
</ul>', 'https://www.youtube.com/watch?v=RJEnTRBxaSg', 1800, 2, 70, true, false, '{}', '{}', '2025-11-05 02:06:54.468+07', '2025-11-05 03:09:57.449+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'B├ái 3: Text, Image, v├á Button Widgets', 'L├ám viß╗çc vß╗¢i c├íc widget hiß╗ân thß╗ï nß╗Öi dung v├á t╞░╞íng t├íc', 'text', '<h2>Basic Widgets</h2>

<h3>Text Widget:</h3>
<pre><code>Text(
  ''Hello Flutter'',
  style: TextStyle(fontSize: 24, color: Colors.blue),
)</code></pre>

<h3>Image Widget:</h3>
<pre><code>Image.network(''https://example.com/image.png'')
Image.asset(''assets/logo.png'')</code></pre>

<h3>Button Widgets:</h3>
<pre><code>ElevatedButton(
  onPressed: () {},
  child: Text(''Click me''),
)

TextButton(...)
IconButton(...)</code></pre>', NULL, NULL, 3, 40, true, false, '{}', '{}', '2025-11-05 02:06:54.471+07', '2025-11-05 03:09:57.45+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'B├ái 1: Navigator.push v├á Navigator.pop', '─Éiß╗üu h╞░ß╗¢ng c╞í bß║ún giß╗»a c├íc m├án h├¼nh', 'video', '<h2>Basic Navigation</h2>
<p>Hß╗ìc c├ích chuyß╗ân ─æß╗òi giß╗»a c├íc m├án h├¼nh trong Flutter.</p>

<h3>Navigator.push:</h3>
<pre><code>Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SecondScreen()),
);</code></pre>

<h3>Navigator.pop:</h3>
<pre><code>Navigator.pop(context);</code></pre>', 'https://www.youtube.com/watch?v=nyvwx7o277U', 1200, 1, 50, true, false, '{}', '{}', '2025-11-05 02:06:54.473+07', '2025-11-05 03:09:57.452+07');
INSERT INTO public.lessons VALUES ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'B├ái 2: Named Routes v├á Route Parameters', 'Sß╗¡ dß╗Ñng named routes v├á truyß╗ün dß╗» liß╗çu giß╗»a m├án h├¼nh', 'text', '<h2>Named Routes</h2>

<h3>─Éß╗ïnh ngh─⌐a routes:</h3>
<pre><code>MaterialApp(
  routes: {
    ''/'': (context) => HomeScreen(),
    ''/second'': (context) => SecondScreen(),
  },
)</code></pre>

<h3>─Éiß╗üu h╞░ß╗¢ng:</h3>
<pre><code>Navigator.pushNamed(context, ''/second'');</code></pre>

<h3>Truyß╗ün arguments:</h3>
<pre><code>Navigator.pushNamed(
  context, 
  ''/second'',
  arguments: {''id'': 123},
);</code></pre>', NULL, NULL, 2, 60, true, false, '{}', '{}', '2025-11-05 02:06:54.474+07', '2025-11-05 03:09:57.453+07');


--
-- Data for Name: lesson_materials; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.lesson_progress VALUES ('778be199-fea7-41f1-bc23-19e0ca783e2b', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000001', true, 0, 100, 1800, '2025-10-29 02:10:31.331+07', '2025-11-05 02:10:31.331+07', '2025-11-05 02:10:31.331+07', NULL, false, NULL, '2025-11-05 02:10:31.331+07', '2025-11-05 03:09:57.49+07');
INSERT INTO public.lesson_progress VALUES ('02ad2e9c-27c6-4631-a487-bb736a209dfa', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', true, 0, 100, 1800, '2025-10-29 02:10:31.346+07', '2025-11-05 02:10:31.346+07', '2025-11-05 02:10:31.346+07', NULL, false, NULL, '2025-11-05 02:10:31.346+07', '2025-11-05 03:09:57.491+07');
INSERT INTO public.lesson_progress VALUES ('7765fdbd-3084-48c7-a14a-d3bc02adf94e', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000003', true, 0, 100, 1800, '2025-10-29 02:10:31.346+07', '2025-11-05 02:10:31.346+07', '2025-11-05 02:10:31.346+07', NULL, false, NULL, '2025-11-05 02:10:31.346+07', '2025-11-05 03:09:57.492+07');
INSERT INTO public.lesson_progress VALUES ('d7d35a09-d8fd-4a35-968b-1d125bf67b46', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000004', true, 0, 100, 1800, '2025-10-29 02:10:31.348+07', '2025-11-05 02:10:31.348+07', '2025-11-05 02:10:31.348+07', NULL, false, NULL, '2025-11-05 02:10:31.348+07', '2025-11-05 03:09:57.493+07');
INSERT INTO public.lesson_progress VALUES ('576dd5cd-5f8e-41bb-a6e5-3007c89ce311', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000005', true, 0, 100, 1800, '2025-10-29 02:10:31.349+07', '2025-11-05 02:10:31.349+07', '2025-11-05 02:10:31.349+07', NULL, false, NULL, '2025-11-05 02:10:31.349+07', '2025-11-05 03:09:57.493+07');
INSERT INTO public.lesson_progress VALUES ('3a1a223e-d0f1-4272-8694-d9c8ce69f500', '00000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', true, 0, 100, 1800, '2025-10-29 02:10:31.349+07', '2025-11-05 02:10:31.349+07', '2025-11-05 02:10:31.349+07', NULL, false, NULL, '2025-11-05 02:10:31.349+07', '2025-11-05 03:09:57.494+07');


--
-- Data for Name: live_sessions; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: live_session_attendance; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.migrations VALUES (1, '001', 'Create users table', '2025-10-13 18:46:25.393729');
INSERT INTO public.migrations VALUES (2, '002', 'Create courses table', '2025-10-13 18:46:25.419245');
INSERT INTO public.migrations VALUES (3, '003', 'Create enrollments table', '2025-10-13 18:46:25.466633');
INSERT INTO public.migrations VALUES (4, '004', 'Create chat messages table', '2025-10-13 18:46:25.484068');
INSERT INTO public.migrations VALUES (5, '005', 'Add indexes to users table', '2025-10-13 18:46:25.51492');
INSERT INTO public.migrations VALUES (6, '006', 'Add indexes to courses table', '2025-10-13 18:46:25.550613');
INSERT INTO public.migrations VALUES (7, '007', 'Add indexes to enrollments table', '2025-10-13 18:46:25.581208');
INSERT INTO public.migrations VALUES (8, '008', 'Add indexes to chat messages table', '2025-10-13 18:46:25.611853');
INSERT INTO public.migrations VALUES (9, '009', 'Create extended LMS tables and alter existing ones', '2025-10-19 10:53:44.629442');
INSERT INTO public.migrations VALUES (10, '010', 'Add email_verified_at column and index to users', '2025-10-30 04:18:15.816656');
INSERT INTO public.migrations VALUES (11, '011', 'Add missing user profile columns to users table', '2025-10-30 04:18:15.89196');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.quizzes VALUES ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Quiz: State Management', 'Kiß╗âm tra kiß║┐n thß╗⌐c vß╗ü quß║ún l├╜ state trong React', 30, 70.00, 3, true, true, '2024-01-01 07:00:00+07', NULL, true, '2025-11-05 02:06:54.477+07', '2025-11-05 03:09:57.455+07');
INSERT INTO public.quizzes VALUES ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Quiz: React Hooks', 'B├ái kiß╗âm tra vß╗ü React Hooks', 25, 75.00, 2, false, true, '2024-01-01 07:00:00+07', NULL, true, '2025-11-05 02:06:54.484+07', '2025-11-05 03:09:57.457+07');


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.quiz_attempts VALUES ('90000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 1, 25.00, 30.00, '2025-11-01 21:00:00+07', '2025-11-01 21:25:00+07', 25, true, '2025-11-05 02:10:31.368+07', '2025-11-05 03:09:57.512+07');


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.quiz_questions VALUES ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'useState hook ─æ╞░ß╗úc sß╗¡ dß╗Ñng ─æß╗â l├ám g├¼?', 'single_choice', 10.00, 1, 'useState l├á hook ─æß╗â quß║ún l├╜ state trong functional component', '2025-11-05 02:06:54.486+07', '2025-11-05 03:09:57.459+07');
INSERT INTO public.quiz_questions VALUES ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'useEffect c├│ thß╗â ─æ╞░ß╗úc sß╗¡ dß╗Ñng ─æß╗â thß╗▒c hiß╗çn side effects?', 'true_false', 5.00, 2, 'useEffect ─æ╞░ß╗úc thiß║┐t kß║┐ ─æß║╖c biß╗çt ─æß╗â xß╗¡ l├╜ side effects', '2025-11-05 02:06:54.499+07', '2025-11-05 03:09:57.467+07');
INSERT INTO public.quiz_questions VALUES ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'C├íc hooks n├áo sau ─æ├óy l├á built-in hooks cß╗ºa React?', 'multiple_choice', 15.00, 3, 'useState, useEffect, useContext ─æß╗üu l├á built-in hooks', '2025-11-05 02:06:54.505+07', '2025-11-05 03:09:57.47+07');
INSERT INTO public.quiz_questions VALUES ('70000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', 'Khi n├áo n├¬n sß╗¡ dß╗Ñng useCallback?', 'single_choice', 10.00, 1, 'useCallback ─æ╞░ß╗úc d├╣ng ─æß╗â memoize functions', '2025-11-05 02:06:54.51+07', '2025-11-05 03:09:57.474+07');
INSERT INTO public.quiz_questions VALUES ('70000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', 'useMemo v├á useCallback c├│ chß╗⌐c n─âng giß╗æng nhau?', 'true_false', 5.00, 2, 'useMemo memoize values, useCallback memoize functions', '2025-11-05 02:06:54.519+07', '2025-11-05 03:09:57.478+07');


--
-- Data for Name: quiz_options; Type: TABLE DATA; Schema: public; Owner: lms_user
--

INSERT INTO public.quiz_options VALUES ('95af29d8-052b-450c-b690-48547d4dfa14', '70000000-0000-0000-0000-000000000001', 'Quß║ún l├╜ state trong component', true, 1, '2025-11-05 02:06:54.491+07', '2025-11-05 02:06:54.491+07');
INSERT INTO public.quiz_options VALUES ('28f4f61e-a857-40b9-8378-36cddb696aeb', '70000000-0000-0000-0000-000000000001', 'Fetch data tß╗½ API', false, 2, '2025-11-05 02:06:54.497+07', '2025-11-05 02:06:54.497+07');
INSERT INTO public.quiz_options VALUES ('f0135626-673f-4b5a-8aca-088c973abbea', '70000000-0000-0000-0000-000000000001', 'Tß║ío side effects', false, 3, '2025-11-05 02:06:54.498+07', '2025-11-05 02:06:54.498+07');
INSERT INTO public.quiz_options VALUES ('9821296b-5bc4-473e-bb05-8149a43febda', '70000000-0000-0000-0000-000000000001', '─Éiß╗üu h╞░ß╗¢ng routing', false, 4, '2025-11-05 02:06:54.498+07', '2025-11-05 02:06:54.498+07');
INSERT INTO public.quiz_options VALUES ('fd2b3969-7592-4a75-8470-ac50cea49ec2', '70000000-0000-0000-0000-000000000002', '─É├║ng', true, 1, '2025-11-05 02:06:54.502+07', '2025-11-05 02:06:54.502+07');
INSERT INTO public.quiz_options VALUES ('2b681a41-0db8-41b2-9aa4-463be2320e6f', '70000000-0000-0000-0000-000000000002', 'Sai', false, 2, '2025-11-05 02:06:54.503+07', '2025-11-05 02:06:54.503+07');
INSERT INTO public.quiz_options VALUES ('3e603417-63da-44e0-bed5-596863ad482f', '70000000-0000-0000-0000-000000000003', 'useState', true, 1, '2025-11-05 02:06:54.506+07', '2025-11-05 02:06:54.506+07');
INSERT INTO public.quiz_options VALUES ('3efa71ed-1b95-42c8-81a9-b21eb2e853da', '70000000-0000-0000-0000-000000000003', 'useEffect', true, 2, '2025-11-05 02:06:54.507+07', '2025-11-05 02:06:54.507+07');
INSERT INTO public.quiz_options VALUES ('bdaf87f8-4dc1-40b6-a7ff-83647035be9d', '70000000-0000-0000-0000-000000000003', 'useContext', true, 3, '2025-11-05 02:06:54.508+07', '2025-11-05 02:06:54.508+07');
INSERT INTO public.quiz_options VALUES ('cdf9b7e5-8d14-4056-927f-987e096339dc', '70000000-0000-0000-0000-000000000003', 'useCustomHook', false, 4, '2025-11-05 02:06:54.509+07', '2025-11-05 02:06:54.509+07');
INSERT INTO public.quiz_options VALUES ('ba687486-b09d-4985-9caa-17f2c9895f72', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn memoize functions', true, 1, '2025-11-05 02:06:54.513+07', '2025-11-05 02:06:54.513+07');
INSERT INTO public.quiz_options VALUES ('f9db89ee-6189-4b5e-9a14-d4b3db26c773', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn quß║ún l├╜ state', false, 2, '2025-11-05 02:06:54.515+07', '2025-11-05 02:06:54.515+07');
INSERT INTO public.quiz_options VALUES ('f1deddcc-8d18-4f3c-86b0-eb3cb832afc1', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn fetch data', false, 3, '2025-11-05 02:06:54.516+07', '2025-11-05 02:06:54.516+07');
INSERT INTO public.quiz_options VALUES ('192bf8f0-bec4-410f-8c4e-26e78d0c7da1', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn tß║ío component', false, 4, '2025-11-05 02:06:54.518+07', '2025-11-05 02:06:54.518+07');
INSERT INTO public.quiz_options VALUES ('e01bd2df-ef41-4cc9-8d47-2c85a6694c75', '70000000-0000-0000-0000-000000000005', '─É├║ng', false, 1, '2025-11-05 02:06:54.521+07', '2025-11-05 02:06:54.521+07');
INSERT INTO public.quiz_options VALUES ('35b71dd1-d326-4158-aacc-2cbc4742438b', '70000000-0000-0000-0000-000000000005', 'Sai', true, 2, '2025-11-05 02:06:54.522+07', '2025-11-05 02:06:54.522+07');
INSERT INTO public.quiz_options VALUES ('8c2e13b0-67a6-4432-a269-2d225d122f3f', '70000000-0000-0000-0000-000000000001', 'Quß║ún l├╜ state trong component', true, 1, '2025-11-05 02:07:29.936+07', '2025-11-05 02:07:29.936+07');
INSERT INTO public.quiz_options VALUES ('24cf1939-1d88-4246-9242-05dd920ef165', '70000000-0000-0000-0000-000000000001', 'Fetch data tß╗½ API', false, 2, '2025-11-05 02:07:29.94+07', '2025-11-05 02:07:29.94+07');
INSERT INTO public.quiz_options VALUES ('6ffb08d6-ac1b-4ea6-a300-fbdeaf4b1410', '70000000-0000-0000-0000-000000000001', 'Tß║ío side effects', false, 3, '2025-11-05 02:07:29.941+07', '2025-11-05 02:07:29.941+07');
INSERT INTO public.quiz_options VALUES ('b5142d62-be15-445d-bed0-6914cbfd2cdf', '70000000-0000-0000-0000-000000000001', '─Éiß╗üu h╞░ß╗¢ng routing', false, 4, '2025-11-05 02:07:29.941+07', '2025-11-05 02:07:29.941+07');
INSERT INTO public.quiz_options VALUES ('5a5d6fd5-fa7f-47e1-9035-16c98c3cd62c', '70000000-0000-0000-0000-000000000002', '─É├║ng', true, 1, '2025-11-05 02:07:29.942+07', '2025-11-05 02:07:29.942+07');
INSERT INTO public.quiz_options VALUES ('cedb939c-ae1f-423d-9cf2-acdfefde5434', '70000000-0000-0000-0000-000000000002', 'Sai', false, 2, '2025-11-05 02:07:29.943+07', '2025-11-05 02:07:29.943+07');
INSERT INTO public.quiz_options VALUES ('450ecafe-0881-416c-8fa7-18b661f552fc', '70000000-0000-0000-0000-000000000003', 'useState', true, 1, '2025-11-05 02:07:29.945+07', '2025-11-05 02:07:29.945+07');
INSERT INTO public.quiz_options VALUES ('2cae153e-c5c1-4ac0-a4a3-6a82a0a69c01', '70000000-0000-0000-0000-000000000003', 'useEffect', true, 2, '2025-11-05 02:07:29.945+07', '2025-11-05 02:07:29.945+07');
INSERT INTO public.quiz_options VALUES ('03560920-edc2-4d18-a600-25f71bead8e4', '70000000-0000-0000-0000-000000000003', 'useContext', true, 3, '2025-11-05 02:07:29.946+07', '2025-11-05 02:07:29.946+07');
INSERT INTO public.quiz_options VALUES ('8dce180e-bbf4-4e26-a9a3-1833ccf1b5ef', '70000000-0000-0000-0000-000000000003', 'useCustomHook', false, 4, '2025-11-05 02:07:29.946+07', '2025-11-05 02:07:29.946+07');
INSERT INTO public.quiz_options VALUES ('ffad1818-cdae-464a-af9f-978aa64d9ad7', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn memoize functions', true, 1, '2025-11-05 02:07:29.947+07', '2025-11-05 02:07:29.947+07');
INSERT INTO public.quiz_options VALUES ('30d9de75-888f-4313-be42-12cf13072f72', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn quß║ún l├╜ state', false, 2, '2025-11-05 02:07:29.948+07', '2025-11-05 02:07:29.948+07');
INSERT INTO public.quiz_options VALUES ('6c109a24-982b-4702-a159-c76d0a3071c1', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn fetch data', false, 3, '2025-11-05 02:07:29.948+07', '2025-11-05 02:07:29.948+07');
INSERT INTO public.quiz_options VALUES ('75c6b093-6df3-4965-82a2-39c7c95f0081', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn tß║ío component', false, 4, '2025-11-05 02:07:29.948+07', '2025-11-05 02:07:29.948+07');
INSERT INTO public.quiz_options VALUES ('db020e80-871c-4caa-92a7-a951d6b440f4', '70000000-0000-0000-0000-000000000005', '─É├║ng', false, 1, '2025-11-05 02:07:29.949+07', '2025-11-05 02:07:29.949+07');
INSERT INTO public.quiz_options VALUES ('baa9c658-6603-463b-9290-561188db5f6e', '70000000-0000-0000-0000-000000000005', 'Sai', true, 2, '2025-11-05 02:07:29.95+07', '2025-11-05 02:07:29.95+07');
INSERT INTO public.quiz_options VALUES ('513de4df-39f9-457d-958a-2d918b3aa698', '70000000-0000-0000-0000-000000000001', 'Quß║ún l├╜ state trong component', true, 1, '2025-11-05 02:10:31.306+07', '2025-11-05 02:10:31.306+07');
INSERT INTO public.quiz_options VALUES ('ef114d9e-925c-46f1-84d2-3652eaf69033', '70000000-0000-0000-0000-000000000001', 'Fetch data tß╗½ API', false, 2, '2025-11-05 02:10:31.31+07', '2025-11-05 02:10:31.31+07');
INSERT INTO public.quiz_options VALUES ('eba31b24-f505-4430-9270-7df9ab51e960', '70000000-0000-0000-0000-000000000001', 'Tß║ío side effects', false, 3, '2025-11-05 02:10:31.311+07', '2025-11-05 02:10:31.311+07');
INSERT INTO public.quiz_options VALUES ('7d3caa50-015c-4564-b55c-0eee640f0cd5', '70000000-0000-0000-0000-000000000001', '─Éiß╗üu h╞░ß╗¢ng routing', false, 4, '2025-11-05 02:10:31.311+07', '2025-11-05 02:10:31.311+07');
INSERT INTO public.quiz_options VALUES ('5fa729e8-ccf9-45bb-96e2-3624f89e8d05', '70000000-0000-0000-0000-000000000002', '─É├║ng', true, 1, '2025-11-05 02:10:31.313+07', '2025-11-05 02:10:31.313+07');
INSERT INTO public.quiz_options VALUES ('9ca61b83-26a8-4cf0-8805-49ebcb7a3664', '70000000-0000-0000-0000-000000000002', 'Sai', false, 2, '2025-11-05 02:10:31.314+07', '2025-11-05 02:10:31.314+07');
INSERT INTO public.quiz_options VALUES ('5055a792-6a4e-454e-9910-37fa67d8962a', '70000000-0000-0000-0000-000000000003', 'useState', true, 1, '2025-11-05 02:10:31.315+07', '2025-11-05 02:10:31.315+07');
INSERT INTO public.quiz_options VALUES ('2327ed76-567d-4205-b0de-c0686349e7b3', '70000000-0000-0000-0000-000000000003', 'useEffect', true, 2, '2025-11-05 02:10:31.316+07', '2025-11-05 02:10:31.316+07');
INSERT INTO public.quiz_options VALUES ('7f61f0aa-0b7b-4139-b3f5-e7eea8b3d23d', '70000000-0000-0000-0000-000000000003', 'useContext', true, 3, '2025-11-05 02:10:31.316+07', '2025-11-05 02:10:31.316+07');
INSERT INTO public.quiz_options VALUES ('476a96b5-0d75-4703-aa0c-79eb8aba5666', '70000000-0000-0000-0000-000000000003', 'useCustomHook', false, 4, '2025-11-05 02:10:31.317+07', '2025-11-05 02:10:31.317+07');
INSERT INTO public.quiz_options VALUES ('2ac1a5c2-8ca7-43a9-aea7-34842fa56b45', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn memoize functions', true, 1, '2025-11-05 02:10:31.319+07', '2025-11-05 02:10:31.319+07');
INSERT INTO public.quiz_options VALUES ('c89d5b97-4c87-4f96-b376-4f33db432953', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn quß║ún l├╜ state', false, 2, '2025-11-05 02:10:31.319+07', '2025-11-05 02:10:31.319+07');
INSERT INTO public.quiz_options VALUES ('46c59150-1451-4b6c-a991-b3b3e917fb6e', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn fetch data', false, 3, '2025-11-05 02:10:31.32+07', '2025-11-05 02:10:31.32+07');
INSERT INTO public.quiz_options VALUES ('f0d4ed48-19b0-40f8-a9e4-371ddb11b3d5', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn tß║ío component', false, 4, '2025-11-05 02:10:31.321+07', '2025-11-05 02:10:31.321+07');
INSERT INTO public.quiz_options VALUES ('7a332378-2554-4463-b826-2d28c7940307', '70000000-0000-0000-0000-000000000005', '─É├║ng', false, 1, '2025-11-05 02:10:31.323+07', '2025-11-05 02:10:31.323+07');
INSERT INTO public.quiz_options VALUES ('d7392245-5aae-4df9-9ef7-e8611f93e391', '70000000-0000-0000-0000-000000000005', 'Sai', true, 2, '2025-11-05 02:10:31.324+07', '2025-11-05 02:10:31.324+07');
INSERT INTO public.quiz_options VALUES ('701c1ca6-6431-4345-9a49-7e430ba5bb3d', '70000000-0000-0000-0000-000000000001', 'Quß║ún l├╜ state trong component', true, 1, '2025-11-05 02:13:41.611+07', '2025-11-05 02:13:41.611+07');
INSERT INTO public.quiz_options VALUES ('75d4b859-f2f2-486f-9f5a-013b481a0632', '70000000-0000-0000-0000-000000000001', 'Fetch data tß╗½ API', false, 2, '2025-11-05 02:13:41.615+07', '2025-11-05 02:13:41.615+07');
INSERT INTO public.quiz_options VALUES ('fe3d5b67-151c-4aa4-9136-1364a8529354', '70000000-0000-0000-0000-000000000001', 'Tß║ío side effects', false, 3, '2025-11-05 02:13:41.615+07', '2025-11-05 02:13:41.615+07');
INSERT INTO public.quiz_options VALUES ('aaef0343-04c8-4ad3-ace4-248f55d78677', '70000000-0000-0000-0000-000000000001', '─Éiß╗üu h╞░ß╗¢ng routing', false, 4, '2025-11-05 02:13:41.616+07', '2025-11-05 02:13:41.616+07');
INSERT INTO public.quiz_options VALUES ('a993960c-bb4e-44be-84a0-d725cf1e2589', '70000000-0000-0000-0000-000000000002', '─É├║ng', true, 1, '2025-11-05 02:13:41.617+07', '2025-11-05 02:13:41.617+07');
INSERT INTO public.quiz_options VALUES ('9538674b-5328-4954-8a60-2254b9a5c716', '70000000-0000-0000-0000-000000000002', 'Sai', false, 2, '2025-11-05 02:13:41.618+07', '2025-11-05 02:13:41.618+07');
INSERT INTO public.quiz_options VALUES ('f3145c1a-ffd5-4dfc-b149-907f6bb91c1c', '70000000-0000-0000-0000-000000000003', 'useState', true, 1, '2025-11-05 02:13:41.62+07', '2025-11-05 02:13:41.62+07');
INSERT INTO public.quiz_options VALUES ('117a9ec3-a4ba-42df-a03d-c6b632a36f66', '70000000-0000-0000-0000-000000000003', 'useEffect', true, 2, '2025-11-05 02:13:41.62+07', '2025-11-05 02:13:41.62+07');
INSERT INTO public.quiz_options VALUES ('e4e423e1-6487-4d9a-9616-6b130a572dae', '70000000-0000-0000-0000-000000000003', 'useContext', true, 3, '2025-11-05 02:13:41.621+07', '2025-11-05 02:13:41.621+07');
INSERT INTO public.quiz_options VALUES ('bc181e71-06b5-4260-9158-b67add6a6b20', '70000000-0000-0000-0000-000000000003', 'useCustomHook', false, 4, '2025-11-05 02:13:41.621+07', '2025-11-05 02:13:41.621+07');
INSERT INTO public.quiz_options VALUES ('7907b26a-edc0-49bb-a811-b247fa398291', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn memoize functions', true, 1, '2025-11-05 02:13:41.622+07', '2025-11-05 02:13:41.622+07');
INSERT INTO public.quiz_options VALUES ('0faaaa0c-f590-423c-9acc-4b879ade1d62', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn quß║ún l├╜ state', false, 2, '2025-11-05 02:13:41.623+07', '2025-11-05 02:13:41.623+07');
INSERT INTO public.quiz_options VALUES ('e64a4ec2-cd55-4e26-a30c-e3dbeaca1998', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn fetch data', false, 3, '2025-11-05 02:13:41.623+07', '2025-11-05 02:13:41.623+07');
INSERT INTO public.quiz_options VALUES ('f391397d-a340-481b-bd9f-2c0c65ace5d9', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn tß║ío component', false, 4, '2025-11-05 02:13:41.624+07', '2025-11-05 02:13:41.624+07');
INSERT INTO public.quiz_options VALUES ('780b3684-1f87-4cb5-9761-880a85b6221c', '70000000-0000-0000-0000-000000000005', '─É├║ng', false, 1, '2025-11-05 02:13:41.625+07', '2025-11-05 02:13:41.625+07');
INSERT INTO public.quiz_options VALUES ('bd1260ab-7d2d-4af1-8c66-88c9220f32b6', '70000000-0000-0000-0000-000000000005', 'Sai', true, 2, '2025-11-05 02:13:41.625+07', '2025-11-05 02:13:41.625+07');
INSERT INTO public.quiz_options VALUES ('3db2fbb8-7dca-4317-b7cd-2a2c0799f461', '70000000-0000-0000-0000-000000000001', 'Quß║ún l├╜ state trong component', true, 1, '2025-11-05 03:09:57.461+07', '2025-11-05 03:09:57.461+07');
INSERT INTO public.quiz_options VALUES ('59062a71-4dd1-4a00-aa23-0b387f6d061f', '70000000-0000-0000-0000-000000000001', 'Fetch data tß╗½ API', false, 2, '2025-11-05 03:09:57.464+07', '2025-11-05 03:09:57.464+07');
INSERT INTO public.quiz_options VALUES ('bb09f77b-543c-4118-9cd1-d73dac2624cf', '70000000-0000-0000-0000-000000000001', 'Tß║ío side effects', false, 3, '2025-11-05 03:09:57.465+07', '2025-11-05 03:09:57.465+07');
INSERT INTO public.quiz_options VALUES ('727706dd-ec21-440b-8f66-c611ea6f5859', '70000000-0000-0000-0000-000000000001', '─Éiß╗üu h╞░ß╗¢ng routing', false, 4, '2025-11-05 03:09:57.466+07', '2025-11-05 03:09:57.466+07');
INSERT INTO public.quiz_options VALUES ('8408cffd-46e8-4b64-a1e5-33bb90b0c5be', '70000000-0000-0000-0000-000000000002', '─É├║ng', true, 1, '2025-11-05 03:09:57.468+07', '2025-11-05 03:09:57.468+07');
INSERT INTO public.quiz_options VALUES ('a64fbfcb-022b-4f1e-befd-ccb65ca9ca9e', '70000000-0000-0000-0000-000000000002', 'Sai', false, 2, '2025-11-05 03:09:57.469+07', '2025-11-05 03:09:57.469+07');
INSERT INTO public.quiz_options VALUES ('40e1dc10-305d-4ce7-95f8-6328e3bb6ed5', '70000000-0000-0000-0000-000000000003', 'useState', true, 1, '2025-11-05 03:09:57.471+07', '2025-11-05 03:09:57.471+07');
INSERT INTO public.quiz_options VALUES ('6e539c23-b997-400c-ae5d-472cdabad58c', '70000000-0000-0000-0000-000000000003', 'useEffect', true, 2, '2025-11-05 03:09:57.472+07', '2025-11-05 03:09:57.472+07');
INSERT INTO public.quiz_options VALUES ('2291e0d7-e7c5-42b3-bd90-cf34546a88e9', '70000000-0000-0000-0000-000000000003', 'useContext', true, 3, '2025-11-05 03:09:57.473+07', '2025-11-05 03:09:57.473+07');
INSERT INTO public.quiz_options VALUES ('d09a804f-99bd-436c-bf73-43399fa92e91', '70000000-0000-0000-0000-000000000003', 'useCustomHook', false, 4, '2025-11-05 03:09:57.473+07', '2025-11-05 03:09:57.473+07');
INSERT INTO public.quiz_options VALUES ('6731b366-8012-45f1-b806-9e1314d4234f', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn memoize functions', true, 1, '2025-11-05 03:09:57.475+07', '2025-11-05 03:09:57.475+07');
INSERT INTO public.quiz_options VALUES ('2ce393cf-b801-40cc-a420-20a60e80b819', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn quß║ún l├╜ state', false, 2, '2025-11-05 03:09:57.476+07', '2025-11-05 03:09:57.476+07');
INSERT INTO public.quiz_options VALUES ('29cf1282-1f3f-4609-9a63-ff4204b5848a', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn fetch data', false, 3, '2025-11-05 03:09:57.477+07', '2025-11-05 03:09:57.477+07');
INSERT INTO public.quiz_options VALUES ('f324e663-620a-4cc8-8b2e-e2ade985a8e0', '70000000-0000-0000-0000-000000000004', 'Khi cß║ºn tß║ío component', false, 4, '2025-11-05 03:09:57.477+07', '2025-11-05 03:09:57.477+07');
INSERT INTO public.quiz_options VALUES ('25655493-9db6-4168-892b-e23d5f48f4c2', '70000000-0000-0000-0000-000000000005', '─É├║ng', false, 1, '2025-11-05 03:09:57.479+07', '2025-11-05 03:09:57.479+07');
INSERT INTO public.quiz_options VALUES ('6afbd9c3-839f-4382-8ae6-ffec0aa8c755', '70000000-0000-0000-0000-000000000005', 'Sai', true, 2, '2025-11-05 03:09:57.48+07', '2025-11-05 03:09:57.48+07');


--
-- Data for Name: quiz_answers; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: seeders; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: public; Owner: lms_user
--



--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.migrations_id_seq', 11, true);


--
-- Name: seeders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.seeders_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict k2aY8cGxoXJFMlRo1N4uiLPrM3EjsHXGw4ucFiPG1VchWeCpxzw2FTgol3gjMUw

