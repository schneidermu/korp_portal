SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

COPY public.employees_organization (id, name, address) FROM stdin;
1	ЦА ФАВР	Кедрова 8к1
\.

COPY public.employees_structuralsubdivision (id, name, organization_id) FROM stdin;
1	Отдел регулирования режимов работы водохранилищ	1
\.


COPY public.employees_employee (password, last_login, is_superuser, username, first_name, last_name, is_staff, is_active, date_joined, id, fio, birth_date, email, telephone_number, job_title, class_rank, status, structural_division_id) FROM stdin;
pbkdf2_sha256$600000$KcFnSgSq6RlEama1ykFgYK$+GJKXqgAA/a1fW7jc/WsS+nKZvRn4bmaeQ+H0RI8vdg=	\N	t	admin	Иванов	Иван	t	t	2024-11-06 12:00:00+00	4b5c034a-bfa3-4de5-a5f5-52230e607b35	Иванов Иван Иванович	1980-01-01	admin@voda.gov.ru	+78009990001	Руководитель	1 чин	На рабочем месте	1
pbkdf2_sha256$600000$wUuQfc20BbClyMZPkWRhh9$R4CsXK+84D+QY2/sk7x0kjEZgkoaM/AUI7+VZk0XZV4=	\N	f	petrov	Пётр	Петров	f	t	2024-11-06 12:00:00+00	918f8564-bcd0-4f01-a3b0-dc24d1c1d96f	Петров Пётр Петрович	1980-02-02	petrov@voda.gov.ru	+78009990002	Разработчик	2 чин	В командировке	1
\.

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
zu7rmez786u1g645qc0etyvcswczbad5	.eJxVjDsOwyAQRO9CHRCwLOCU6XMGa1nWcT6yJX-qKHePLblImpFG8968VUvr0rfrLFN7r-qsQkG2EEiXjkCHKqgJO9ToPViJNhVAdfrVCvFTht2tDxpuo-FxWKZ7MTtijnU217HK63Kwfwc9zf1mJ8-2KdUDh4ZSI6mIZMdbDaFWB5Ij2EROcpfRJaQthSE6dk58RPX5AuxgQKQ:1t8gLZ:jY9iPODtDWl57Kx7EAY-gSfwb3t3KLhfuiqHCI9vXHU	2100-01-01
\.

COPY public.employees_characteristic (id, experience, about, employee_id, avatar) FROM stdin;
1	10	Я люблю спорт, не люблю когда сотрудники опаздывают. В обед хожу в магазин, потому что у нас нет столовой. По выходным я хожу в спорт зал “Фитнес”. Мои любимые пирожки: с картошкой и капустой.	4b5c034a-bfa3-4de5-a5f5-52230e607b35	employees/avatars/64550e7495957ef5b35757754b605443_81gah4N.png
\.

COPY public.employees_career (id, date_start, name, characteristic_id, date_finish) FROM stdin;
1	2023-01-01	Главный специалист	1	\N
2	2015-01-01	Советник главного специалиста	1	2023-01-01
\.

COPY public.employees_competence (id, name, characteristic_id) FROM stdin;
1	Ведение переговоров, ведение блокнота, BPMN, умение общаться, английский язык (со словарем), уверенное знание doc, excel.	1
\.

COPY public.employees_conference (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_course (id, name, date, characteristic_id, file) FROM stdin;
1	Академия Кулинарии в Челябинке	2025-01-01	1	employees/%(class)s/согласие_dk00rnh.doc
\.

COPY public.employees_diploma (id, name, file, date, characteristic_id) FROM stdin;
\.

COPY public.employees_employee_groups (id, employee_id, group_id) FROM stdin;
\.

COPY public.employees_employee_user_permissions (id, employee_id, permission_id) FROM stdin;
\.

COPY public.employees_hobby (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_performance (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_rating (id, rate, employee_id, user_id) FROM stdin;
1	5	4b5c034a-bfa3-4de5-a5f5-52230e607b35	918f8564-bcd0-4f01-a3b0-dc24d1c1d96f
\.

COPY public.employees_reward (id, name, characteristic_id, file) FROM stdin;
1	Сертификат по стрельбе	1	employees/%(class)s/3cf67d9484e5bf2aa0a33f1f3198501c_oUSf1FX.png
\.

COPY public.employees_sport (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_training (id, name, characteristic_id, file) FROM stdin;
1	Курсы по excel	1	employees/%(class)s/образец_V39Wxon.docx
\.

COPY public.employees_university (id, name, file, date, characteristic_id) FROM stdin;
1	Нью-Йорский Государственный университет, филиал в Саратове		2025-01-01	1
\.

COPY public.employees_victory (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_volunteer (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.homepage_poll (id, is_published, created_at, question_text, pub_date, is_anonymous, is_multiple_choice) FROM stdin;
1	t	2024-11-06 12:00:00+00	Куда поедете отдыхать в отпуск?	2024-11-06 12:00:00+00	f	f
2	t	2024-11-06 12:00:00+00	Какой социальной сетью вы пользуетесь?	2024-05-27 12:00:00+00	f	t
\.

COPY public.homepage_choice (id, choice_text, poll_id) FROM stdin;
1	На море	1
2	Не поеду	1
3	На дачу	1
4	Останусь дома	1
5	ВКонтакте	2
6	Одноклассники	2
7	Twitter	2
8	Facebook	2
\.


COPY public.homepage_choice_voted (id, choice_id, employee_id) FROM stdin;
\.


COPY public.homepage_news (id, is_published, created_at, title, text, image, video, pub_date) FROM stdin;
1	t	2024-11-06 12:00:00+00	Росводресурсы отпраздновали Дни Дона и Волги	Росводресурсы отпраздновали Дни Дона и Волги	news/ebcec8d5077cec374bd8cfbada135f01_Krj51IH.png		2024-05-29 14:00:00+00
\.


COPY public.homepage_news_organization (id, news_id, organization_id) FROM stdin;
1	1	1
\.
