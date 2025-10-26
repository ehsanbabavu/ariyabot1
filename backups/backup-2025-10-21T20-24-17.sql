--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    title text NOT NULL,
    full_address text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    postal_code text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: ai_token_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_token_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    provider text NOT NULL,
    workspace_id text,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_token_settings OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    cart_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total_price numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    item_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    parent_id character varying,
    created_by character varying NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: internal_chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.internal_chats (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sender_id character varying NOT NULL,
    receiver_id character varying NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.internal_chats OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total_price numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    seller_id character varying NOT NULL,
    address_id character varying,
    total_amount numeric(15,2) NOT NULL,
    status text DEFAULT 'awaiting_payment'::text NOT NULL,
    status_history text[] DEFAULT '{}'::text[],
    order_number text NOT NULL,
    shipping_method text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: password_reset_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_otps (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    otp text NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_reset_otps OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    category_id character varying,
    image text,
    quantity integer DEFAULT 0 NOT NULL,
    price_before_discount numeric(15,2) NOT NULL,
    price_after_discount numeric(15,2),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: received_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.received_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    whatsiplus_id text NOT NULL,
    sender text NOT NULL,
    message text NOT NULL,
    image_url text,
    status text DEFAULT 'خوانده نشده'::text NOT NULL,
    original_date text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.received_messages OWNER TO postgres;

--
-- Name: sent_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sent_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    recipient text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sent_messages OWNER TO postgres;

--
-- Name: shipping_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    post_pishtaz_enabled boolean DEFAULT false NOT NULL,
    post_normal_enabled boolean DEFAULT false NOT NULL,
    piyk_enabled boolean DEFAULT false NOT NULL,
    free_shipping_enabled boolean DEFAULT false NOT NULL,
    free_shipping_min_amount numeric(15,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.shipping_settings OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    image text,
    user_level text NOT NULL,
    price_before_discount numeric(15,2),
    price_after_discount numeric(15,2),
    duration text DEFAULT 'monthly'::text NOT NULL,
    features text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    subject text NOT NULL,
    category text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'unread'::text NOT NULL,
    attachments text[],
    admin_reply text,
    admin_reply_at timestamp without time zone,
    last_response_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    order_id character varying,
    type text NOT NULL,
    amount numeric(15,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    transaction_date text,
    transaction_time text,
    account_source text,
    payment_method text,
    reference_id text,
    initiator_user_id character varying,
    parent_user_id character varying,
    approved_by_user_id character varying,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    subscription_id character varying NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    start_date timestamp without time zone DEFAULT now(),
    end_date timestamp without time zone NOT NULL,
    remaining_days integer DEFAULT 0 NOT NULL,
    is_trial_period boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text NOT NULL,
    whatsapp_number text,
    whatsapp_token text,
    password text,
    google_id text,
    role text DEFAULT 'user_level_1'::text NOT NULL,
    parent_user_id character varying,
    profile_picture text,
    is_whatsapp_registered boolean DEFAULT false NOT NULL,
    welcome_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vat_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vat_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    vat_percentage numeric(5,2) DEFAULT '9'::numeric NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    company_name text,
    address text,
    phone_number character varying(20),
    national_id character varying(20),
    economic_code character varying(20),
    stamp_image text,
    thank_you_message text DEFAULT 'از خرید شما متشکریم'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vat_settings OWNER TO postgres;

--
-- Name: whatsapp_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    token text,
    is_enabled boolean DEFAULT true NOT NULL,
    notifications text[] DEFAULT '{}'::text[],
    ai_name text DEFAULT 'من هوش مصنوعی هستم'::text NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_settings OWNER TO postgres;

--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, title, full_address, latitude, longitude, postal_code, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_token_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_token_settings (id, token, provider, workspace_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, unit_price, total_price, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, total_amount, item_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, parent_id, created_by, "order", is_active, created_at, updated_at) FROM stdin;
ce913b54-0a00-4e8f-9e64-2c066f6b62f0	گوشی‌های هوشمند	انواع گوشی‌های هوشمند اندروید و آیفون	\N	46d5465d-a8b5-4b10-945f-427605522742	0	t	2025-10-21 19:59:09.580897	2025-10-21 19:59:09.580897
a444dc20-dada-423d-8e36-eb715392d15e	لوازم جانبی موبایل	کیف، کاور، محافظ صفحه و سایر لوازم جانبی	\N	46d5465d-a8b5-4b10-945f-427605522742	1	t	2025-10-21 19:59:09.580897	2025-10-21 19:59:09.580897
4cad2cb7-2c4d-483a-9832-6d7aede8ff6f	تبلت و آیپد	انواع تبلت‌های اندروید و آیپد اپل	\N	46d5465d-a8b5-4b10-945f-427605522742	2	t	2025-10-21 19:59:09.580897	2025-10-21 19:59:09.580897
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, question, answer, "order", is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: internal_chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.internal_chats (id, sender_id, receiver_id, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, seller_id, address_id, total_amount, status, status_history, order_number, shipping_method, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_otps (id, user_id, otp, is_used, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, user_id, name, description, category_id, image, quantity, price_before_discount, price_after_discount, is_active, created_at) FROM stdin;
f29176f7-dd21-40dc-8fe2-583ab0baf1bc	46d5465d-a8b5-4b10-945f-427605522742	آیفون 15 پرو مکس	گوشی آیفون 15 پرو مکس با ظرفیت 256 گیگابایت، رنگ طلایی	ce913b54-0a00-4e8f-9e64-2c066f6b62f0	/uploads/iphone15-pro-max.png	5	45000000.00	43000000.00	t	2025-10-21 19:59:09.620437
ab7545fe-b708-44ec-a75e-cccdf523e2b3	46d5465d-a8b5-4b10-945f-427605522742	سامسونگ گلکسی S24 اولترا	گوشی سامسونگ گلکسی S24 اولترا با ظرفیت 512 گیگابایت	ce913b54-0a00-4e8f-9e64-2c066f6b62f0	/uploads/samsung-s24-ultra.png	8	35000000.00	33500000.00	t	2025-10-21 19:59:09.620437
1925a78c-beba-421e-92bf-f59bfffcb47f	46d5465d-a8b5-4b10-945f-427605522742	کاور چرمی آیفون	کاور چرمی اصل برای آیفون 15 سری، رنگ قهوه‌ای	a444dc20-dada-423d-8e36-eb715392d15e	/uploads/iphone-case.png	20	350000.00	299000.00	t	2025-10-21 19:59:09.620437
5e242347-8f19-42d9-890d-e712893aa768	46d5465d-a8b5-4b10-945f-427605522742	محافظ صفحه شیشه‌ای	محافظ صفحه شیشه‌ای ضد ضربه برای انواع گوشی	a444dc20-dada-423d-8e36-eb715392d15e	/uploads/screen-protector.png	50	120000.00	95000.00	t	2025-10-21 19:59:09.620437
933d2884-2ebb-464c-a1c3-1991d160fdaf	46d5465d-a8b5-4b10-945f-427605522742	آیپد پرو 12.9 اینچ	تبلت آیپد پرو 12.9 اینچ نسل پنجم با چیپ M2	4cad2cb7-2c4d-483a-9832-6d7aede8ff6f	/uploads/ipad-pro.png	3	28000000.00	26500000.00	t	2025-10-21 19:59:09.620437
333606df-2019-4cfb-84c9-5ab1fa7ba730	46d5465d-a8b5-4b10-945f-427605522742	تبلت سامسونگ گلکسی Tab S9	تبلت سامسونگ گلکسی Tab S9 با صفحه 11 اینچ	4cad2cb7-2c4d-483a-9832-6d7aede8ff6f	/uploads/samsung-tab-s9.png	6	18000000.00	17200000.00	t	2025-10-21 19:59:09.620437
\.


--
-- Data for Name: received_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.received_messages (id, user_id, whatsiplus_id, sender, message, image_url, status, original_date, "timestamp") FROM stdin;
\.


--
-- Data for Name: sent_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sent_messages (id, user_id, recipient, message, status, "timestamp") FROM stdin;
\.


--
-- Data for Name: shipping_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_settings (id, user_id, post_pishtaz_enabled, post_normal_enabled, piyk_enabled, free_shipping_enabled, free_shipping_min_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, name, description, image, user_level, price_before_discount, price_after_discount, duration, features, is_active, is_default, created_at) FROM stdin;
6d1409b8-95a2-4448-bee0-2faad1ed8d22	اشتراک رایگان	اشتراک پیش‌فرض رایگان 7 روزه	\N	user_level_1	0.00	\N	monthly	{"دسترسی پایه به سیستم","پشتیبانی محدود","7 روز استفاده رایگان"}	t	t	2025-10-21 19:59:09.288174
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, user_id, subject, category, priority, message, status, attachments, admin_reply, admin_reply_at, last_response_at, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, order_id, type, amount, status, transaction_date, transaction_time, account_source, payment_method, reference_id, initiator_user_id, parent_user_id, approved_by_user_id, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, user_id, subscription_id, status, start_date, end_date, remaining_days, is_trial_period, created_at, updated_at) FROM stdin;
05748b8d-fb65-4f4e-80a0-6ce4087bd9c6	f70236eb-94a7-4f4d-a9c3-9293af45ca08	6d1409b8-95a2-4448-bee0-2faad1ed8d22	active	2025-10-21 20:22:51.042	2025-10-28 20:22:51.042	7	t	2025-10-21 20:22:51.042935	2025-10-21 20:22:51.042935
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, first_name, last_name, email, phone, whatsapp_number, whatsapp_token, password, google_id, role, parent_user_id, profile_picture, is_whatsapp_registered, welcome_message, created_at) FROM stdin;
11b51ae1-628c-49bd-9dec-44533f2a354a	ehsan	احسان	مدیر	ehsan@admin.com	989135621232	\N	\N	$2b$10$My1nGTJwBBlhBOwi4f8TBe7J8CoUT6vK2a/2dr9ET73/pHaQQKjyK	\N	admin	\N	\N	f	\N	2025-10-21 19:59:09.565274
46d5465d-a8b5-4b10-945f-427605522742	test_seller	علی	فروشنده تستی	test@seller.com	09111234567	09111234567	\N	$2b$10$ln4Zd0.N4qRPwx4MRXtW0.FyvYqFKJ59yPAkkIQlS5/tjP8qCcFsW	\N	user_level_1	\N	\N	f	\N	2025-10-21 19:59:09.567606
f70236eb-94a7-4f4d-a9c3-9293af45ca08	ehsan2	احسان	باباگلی	ehsanbabagoli711@gmail.com	09131234567	\N	\N	$2b$10$446qgLpxSq8qLkk6LkChZ.UuHeCeCGxBp./hgngndrliGp09yTAHW	\N	user_level_1	\N	\N	f	\N	2025-10-21 20:22:51.037039
\.


--
-- Data for Name: vat_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vat_settings (id, user_id, vat_percentage, is_enabled, company_name, address, phone_number, national_id, economic_code, stamp_image, thank_you_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_settings (id, token, is_enabled, notifications, ai_name, updated_at) FROM stdin;
\.


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: ai_token_settings ai_token_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_token_settings
    ADD CONSTRAINT ai_token_settings_pkey PRIMARY KEY (id);


--
-- Name: ai_token_settings ai_token_settings_provider_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_token_settings
    ADD CONSTRAINT ai_token_settings_provider_unique UNIQUE (provider);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: internal_chats internal_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_chats
    ADD CONSTRAINT internal_chats_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_otps password_reset_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: received_messages received_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.received_messages
    ADD CONSTRAINT received_messages_pkey PRIMARY KEY (id);


--
-- Name: received_messages received_messages_whatsi_user_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.received_messages
    ADD CONSTRAINT received_messages_whatsi_user_unique UNIQUE (whatsiplus_id, user_id);


--
-- Name: sent_messages sent_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sent_messages
    ADD CONSTRAINT sent_messages_pkey PRIMARY KEY (id);


--
-- Name: shipping_settings shipping_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_settings
    ADD CONSTRAINT shipping_settings_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vat_settings vat_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vat_settings
    ADD CONSTRAINT vat_settings_pkey PRIMARY KEY (id);


--
-- Name: vat_settings vat_settings_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vat_settings
    ADD CONSTRAINT vat_settings_user_id_unique UNIQUE (user_id);


--
-- Name: whatsapp_settings whatsapp_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_settings
    ADD CONSTRAINT whatsapp_settings_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cart_items cart_items_cart_id_carts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_carts_id_fk FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- Name: cart_items cart_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: carts carts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: faqs faqs_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: internal_chats internal_chats_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_chats
    ADD CONSTRAINT internal_chats_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: internal_chats internal_chats_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.internal_chats
    ADD CONSTRAINT internal_chats_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_address_id_addresses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_address_id_addresses_id_fk FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: orders orders_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_otps password_reset_otps_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: received_messages received_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.received_messages
    ADD CONSTRAINT received_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sent_messages sent_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sent_messages
    ADD CONSTRAINT sent_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shipping_settings shipping_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_settings
    ADD CONSTRAINT shipping_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_approved_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_approved_by_user_id_users_id_fk FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_initiator_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_initiator_user_id_users_id_fk FOREIGN KEY (initiator_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: transactions transactions_parent_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_parent_user_id_users_id_fk FOREIGN KEY (parent_user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_subscriptions user_subscriptions_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: user_subscriptions user_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vat_settings vat_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vat_settings
    ADD CONSTRAINT vat_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

