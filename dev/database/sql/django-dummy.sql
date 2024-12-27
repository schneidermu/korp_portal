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

COPY public.employees_structuralsubdivision (organization_id, id, parent_structural_subdivision_id, name) FROM stdin;
1	1	\N	Управление регулирования водохозяйственной деятельности
1	2	1	Отдел регулирования режимов работы водохранилищ
1	3	2	Отдел водопользования
\.

COPY public.employees_employee (structural_division_id, id, chief_id, birth_date, telephone_number, username, email, last_name, first_name, surname, name, patronym, job_title, class_rank, status, is_superuser, is_staff, is_active, date_joined, avatar, password) FROM stdin;
1	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	\N	1980-01-01	+78009990003	ivanov	ivanov@voda.gov.ru	Иванов	Иван	Иванов	Иван	Иванович	Руководитель	1 чин	На рабочем месте	t	t	t	2024-01-01	/media/1.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
1	be0313f8-9e9a-4629-8d67-bc38e8ad4de9	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	1980-01-02	+78009990004	smirnov	smirnov@voda.gov.ru	Смирнов	Сергей	Смирнов	Сергей	Сергеевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/2.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	1980-01-03	+78009990005	kuznetsov	kuznetsov@voda.gov.ru	Кузнецов	Алексей	Кузнецов	Алексей	Алексеевич	Руководитель	1 чин	На рабочем месте	t	t	t	2024-01-01	/media/3.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	77b57065-447d-4b2e-9f50-d471f94cafb6	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	1980-01-04	+78009990006	popov	popov@voda.gov.ru	Попов	Андрей	Попов	Андрей	Андреевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/4.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	245ef7c6-ea94-447b-a4b4-e91904a61190	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	1980-01-05	+78009990007	vasiliev	vasiliev@voda.gov.ru	Васильев	Дмитрий	Васильев	Дмитрий	Дмитриевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/5.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	1f573386-d5ff-4a61-aa82-845e5f7ae9f6	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	1980-01-06	+78009990008	sokolov	sokolov@voda.gov.ru	Соколов	Евгений	Соколов	Евгений	Евгеньевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/6.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	51be9555-4783-48e6-8a3f-fd7956435bfb	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	1980-01-07	+78009990009	morozov	morozov@voda.gov.ru	Морозов	Михаил	Морозов	Михаил	Михайлович	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/7.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
2	89229392-6676-4788-b2a7-e4149d92b1c2	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	1980-01-08	+78009990010	fedorov	fedorov@voda.gov.ru	Федоров	Николай	Федоров	Николай	Николаевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/8.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	946080d9-96fd-4284-8cf3-1a218b2922f2	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	1980-01-09	+78009990011	volkov	volkov@voda.gov.ru	Волков	Александр	Волков	Александр	Александрович	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/9.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	d1154e27-941e-4cae-88b1-85dcac06624e	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-10	+78009990012	kozlov	kozlov@voda.gov.ru	Козлов	Владимир	Козлов	Владимир	Владимирович	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/10.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	16ed161f-baaf-409a-a5ec-c9c90ba66abd	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-11	+78009990013	stefanov	stefanov@voda.gov.ru	Стефанов	Георгий	Стефанов	Георгий	Георгиевич	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/11.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	019a8c0e-8bc5-4567-91fc-e9e48d868c26	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-12	+78009990014	smirnova	smirnova@voda.gov.ru	Смирнова	Екатерина	Смирнова	Екатерина	Екатериновна	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/12.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	86b0fbe9-ceeb-43ce-9eea-293e218d1242	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-13	+78009990015	petrova	petrova@voda.gov.ru	Петрова	Анна	Петрова	Анна	Анновна	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/13.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	20603bd3-7321-417a-a930-b8a9fae19e2b	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-14	+78009990016	ivanova	ivanova@voda.gov.ru	Иванова	Мария	Иванова	Мария	Мариевна	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/14.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
3	993d4ff4-f820-45b5-a1f1-4c845aae2c17	946080d9-96fd-4284-8cf3-1a218b2922f2	1980-01-15	+78009990017	kuznetsova	kuznetsova@voda.gov.ru	Кузнецова	Ольга	Кузнецова	Ольга	Ольговна	Разработчик	2 чин	На рабочем месте	f	f	t	2024-01-01	/media/15.png	pbkdf2_sha256$600000$lvosBDQr57H4gV6kJB77oJ$C/tlh7LyU5QELuZ7sjx0Famp3YVFjydPoi7O/aYhSRQ=
\.

COPY public.employees_characteristic (id, employee_id, experience, about) FROM stdin;
1	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	10	Я люблю спорт, не люблю когда сотрудники опаздывают. В обед хожу в магазин, потому что у нас нет столовой. По выходным я хожу в спорт зал “Фитнес”. Мои любимые пирожки: с картошкой и капустой.
2	be0313f8-9e9a-4629-8d67-bc38e8ad4de9	5	Я люблю читать книги и играть в шахматы. В обед предпочитаю ходить в парк. По выходным я занимаюсь садоводством. Мои любимые блюда: борщ и котлеты.
3	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	7	Я люблю путешествовать и фотографировать. В обед хожу в кафе. По выходным я занимаюсь йогой. Мои любимые блюда: суши и роллы.
4	77b57065-447d-4b2e-9f50-d471f94cafb6	8	Я люблю играть в футбол и смотреть фильмы. В обед хожу в столовую. По выходным я занимаюсь бегом. Мои любимые блюда: пицца и паста.
5	245ef7c6-ea94-447b-a4b4-e91904a61190	6	Я люблю рисовать и слушать музыку. В обед хожу в кафе. По выходным я занимаюсь плаванием. Мои любимые блюда: салаты и супы.
6	1f573386-d5ff-4a61-aa82-845e5f7ae9f6	4	Я люблю играть в теннис и читать книги. В обед хожу в столовую. По выходным я занимаюсь велосипедом. Мои любимые блюда: стейк и картофель.
7	51be9555-4783-48e6-8a3f-fd7956435bfb	9	Я люблю играть в баскетбол и смотреть сериалы. В обед хожу в кафе. По выходным я занимаюсь фитнесом. Мои любимые блюда: бургеры и картофель фри.
8	89229392-6676-4788-b2a7-e4149d92b1c2	3	Я люблю играть в шахматы и слушать подкасты. В обед хожу в столовую. По выходным я занимаюсь садоводством. Мои любимые блюда: борщ и котлеты.
9	946080d9-96fd-4284-8cf3-1a218b2922f2	11	Я люблю играть в волейбол и читать книги. В обед хожу в кафе. По выходным я занимаюсь бегом. Мои любимые блюда: суши и роллы.
10	d1154e27-941e-4cae-88b1-85dcac06624e	2	Я люблю играть в футбол и смотреть фильмы. В обед хожу в столовую. По выходным я занимаюсь плаванием. Мои любимые блюда: пицца и паста.
11	16ed161f-baaf-409a-a5ec-c9c90ba66abd	12	Я люблю рисовать и слушать музыку. В обед хожу в кафе. По выходным я занимаюсь велосипедом. Мои любимые блюда: салаты и супы.
12	019a8c0e-8bc5-4567-91fc-e9e48d868c26	1	Я люблю играть в теннис и читать книги. В обед хожу в столовую. По выходным я занимаюсь фитнесом. Мои любимые блюда: стейк и картофель.
13	86b0fbe9-ceeb-43ce-9eea-293e218d1242	13	Я люблю играть в баскетбол и смотреть сериалы. В обед хожу в кафе. По выходным я занимаюсь бегом. Мои любимые блюда: бургеры и картофель фри.
14	20603bd3-7321-417a-a930-b8a9fae19e2b	14	Я люблю играть в шахматы и слушать подкасты. В обед хожу в столовую. По выходным я занимаюсь садоводством. Мои любимые блюда: борщ и котлеты.
15	993d4ff4-f820-45b5-a1f1-4c845aae2c17	15	Я люблю играть в волейбол и читать книги. В обед хожу в кафе. По выходным я занимаюсь фитнесом. Мои любимые блюда: суши и роллы.
\.

COPY public.employees_career (characteristic_id, id, year_start, year_finish, name) FROM stdin;
1	1	2023	\N	Руководитель
1	2	2015	2023	Главный специалист
1	3	2010	2015	Советник главного специалиста
1	4	2005	2010	Младший специалист
2	5	2023	\N	Разработчик
2	6	2018	2023	Стажер
2	7	2015	2018	Младший разработчик
3	8	2023	\N	Руководитель
3	9	2017	2023	Главный специалист
3	10	2012	2017	Советник главного специалиста
3	11	2007	2012	Младший специалист
4	12	2023	\N	Разработчик
4	13	2019	2023	Стажер
4	14	2016	2019	Младший разработчик
5	15	2023	\N	Разработчик
5	16	2020	2023	Стажер
5	17	2017	2020	Младший разработчик
6	18	2023	\N	Разработчик
6	19	2021	2023	Стажер
6	20	2018	2021	Младший разработчик
7	21	2023	\N	Разработчик
7	22	2022	2023	Стажер
7	23	2019	2022	Младший разработчик
8	24	2023	\N	Разработчик
8	25	2021	2023	Стажер
8	26	2018	2021	Младший разработчик
9	27	2023	\N	Разработчик
9	28	2020	2023	Стажер
9	29	2017	2020	Младший разработчик
10	30	2023	\N	Разработчик
10	31	2019	2023	Стажер
10	32	2016	2019	Младший разработчик
11	33	2023	\N	Разработчик
11	34	2020	2023	Стажер
11	35	2017	2020	Младший разработчик
12	36	2023	\N	Разработчик
12	37	2021	2023	Стажер
12	38	2018	2021	Младший разработчик
13	39	2023	\N	Разработчик
13	40	2022	2023	Стажер
13	41	2019	2022	Младший разработчик
14	42	2023	\N	Разработчик
14	43	2021	2023	Стажер
14	44	2018	2021	Младший разработчик
15	45	2023	\N	Разработчик
15	46	2020	2023	Стажер
15	47	2017	2020	Младший разработчик
\.

COPY public.employees_competence (characteristic_id, id, name) FROM stdin;
1	1	Ведение переговоров, ведение блокнота, BPMN, умение общаться, английский язык (со словарем), уверенное знание doc, excel.
2	2	Анализ данных, SQL, Python, машинное обучение, визуализация данных, умение работать с большими объемами данных.
3	3	Проектное управление, Agile, Scrum, управление рисками, планирование проектов, умение работать в команде.
4	4	Разработка ПО, Java, C++, Git, тестирование, умение писать чистый код.
5	5	Маркетинг, SEO, SMM, анализ рынка, создание рекламных кампаний, умение работать с клиентами.
6	6	Финансовый анализ, бухгалтерский учет, Excel, финансовое планирование, управление бюджетом, умение работать с финансовыми отчетами.
7	7	HR-менеджмент, подбор персонала, обучение и развитие, управление персоналом, умение проводить собеседования, знание трудового законодательства.
8	8	Кибербезопасность, сетевая безопасность, криптография, анализ уязвимостей, управление инцидентами, умение работать с системами безопасности.
9	9	Дизайн, графический дизайн, UX/UI, Adobe Photoshop, Illustrator, умение создавать визуальные концепции.
10	10	Логистика, управление цепочками поставок, планирование транспортировки, управление складом, умение работать с логистическими системами.
11	11	Юридическая поддержка, контрактное право, корпоративное право, управление рисками, умение работать с юридическими документами.
12	12	Образование и обучение, разработка учебных программ, проведение тренингов, оценка знаний, умение работать с образовательными платформами.
13	13	Медицинская поддержка, первая помощь, управление медицинскими записями, умение работать с медицинским оборудованием, знание медицинских терминов.
14	14	Инженерное дело, проектирование, CAD, управление проектами, умение работать с инженерными системами.
15	15	Клиентский сервис, управление отношениями с клиентами, обработка жалоб, умение работать с CRM-системами, знание принципов клиентского сервиса.
\.

COPY public.employees_conference (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_course (id, characteristic_id, year, name, file) FROM stdin;
1	1	2025	Академия Кулинарии в Челябинке	/media/согласие_dk00rnh.doc
\.

COPY public.employees_diploma (id, name, file, year, characteristic_id) FROM stdin;
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
1	5	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
2	4	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
3	3	361cf4a7-3cc5-49a5-b962-fd134bde2ba6	77b57065-447d-4b2e-9f50-d471f94cafb6
4	5	be0313f8-9e9a-4629-8d67-bc38e8ad4de9	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
5	4	be0313f8-9e9a-4629-8d67-bc38e8ad4de9	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
6	3	be0313f8-9e9a-4629-8d67-bc38e8ad4de9	77b57065-447d-4b2e-9f50-d471f94cafb6
7	5	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
8	4	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
9	3	dcc15437-8181-4e9a-89bd-2eadcf55e6d4	77b57065-447d-4b2e-9f50-d471f94cafb6
10	5	77b57065-447d-4b2e-9f50-d471f94cafb6	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
11	4	77b57065-447d-4b2e-9f50-d471f94cafb6	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
12	3	77b57065-447d-4b2e-9f50-d471f94cafb6	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
13	5	245ef7c6-ea94-447b-a4b4-e91904a61190	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
14	4	245ef7c6-ea94-447b-a4b4-e91904a61190	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
15	3	245ef7c6-ea94-447b-a4b4-e91904a61190	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
16	5	1f573386-d5ff-4a61-aa82-845e5f7ae9f6	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
17	4	1f573386-d5ff-4a61-aa82-845e5f7ae9f6	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
18	3	1f573386-d5ff-4a61-aa82-845e5f7ae9f6	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
19	5	51be9555-4783-48e6-8a3f-fd7956435bfb	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
20	4	51be9555-4783-48e6-8a3f-fd7956435bfb	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
21	3	51be9555-4783-48e6-8a3f-fd7956435bfb	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
22	5	89229392-6676-4788-b2a7-e4149d92b1c2	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
23	4	89229392-6676-4788-b2a7-e4149d92b1c2	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
24	3	89229392-6676-4788-b2a7-e4149d92b1c2	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
25	5	946080d9-96fd-4284-8cf3-1a218b2922f2	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
26	4	946080d9-96fd-4284-8cf3-1a218b2922f2	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
27	3	946080d9-96fd-4284-8cf3-1a218b2922f2	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
28	5	d1154e27-941e-4cae-88b1-85dcac06624e	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
29	4	d1154e27-941e-4cae-88b1-85dcac06624e	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
30	3	d1154e27-941e-4cae-88b1-85dcac06624e	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
31	5	16ed161f-baaf-409a-a5ec-c9c90ba66abd	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
32	4	16ed161f-baaf-409a-a5ec-c9c90ba66abd	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
33	3	16ed161f-baaf-409a-a5ec-c9c90ba66abd	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
34	5	019a8c0e-8bc5-4567-91fc-e9e48d868c26	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
35	4	019a8c0e-8bc5-4567-91fc-e9e48d868c26	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
36	3	019a8c0e-8bc5-4567-91fc-e9e48d868c26	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
37	5	86b0fbe9-ceeb-43ce-9eea-293e218d1242	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
38	4	86b0fbe9-ceeb-43ce-9eea-293e218d1242	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
39	3	86b0fbe9-ceeb-43ce-9eea-293e218d1242	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
40	5	20603bd3-7321-417a-a930-b8a9fae19e2b	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
41	4	20603bd3-7321-417a-a930-b8a9fae19e2b	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
42	3	20603bd3-7321-417a-a930-b8a9fae19e2b	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
43	5	993d4ff4-f820-45b5-a1f1-4c845aae2c17	361cf4a7-3cc5-49a5-b962-fd134bde2ba6
44	4	993d4ff4-f820-45b5-a1f1-4c845aae2c17	be0313f8-9e9a-4629-8d67-bc38e8ad4de9
45	3	993d4ff4-f820-45b5-a1f1-4c845aae2c17	dcc15437-8181-4e9a-89bd-2eadcf55e6d4
\.

COPY public.employees_reward (id, name, characteristic_id, file) FROM stdin;
1	Сертификат по стрельбе	1	/media/3cf67d9484e5bf2aa0a33f1f3198501c_oUSf1FX.png
\.

COPY public.employees_sport (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_training (id, name, characteristic_id, file) FROM stdin;
1	Курсы по excel	1	/media/образец_V39Wxon.docx
\.

COPY public.employees_university (id, characteristic_id, year, name, faculty, file) FROM stdin;
1	1	2025	Нью-Йорский Государственный университет, филиал в Саратове	Информационные системы в экономике и юриспруденции, Прикладная информатика	
\.

COPY public.employees_victory (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.employees_volunteer (id, name, characteristic_id, file) FROM stdin;
\.

COPY public.homepage_choice_voted (id, choice_id, employee_id) FROM stdin;
\.
