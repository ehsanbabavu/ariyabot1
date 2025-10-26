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

ALTER TABLE IF EXISTS ONLY public.vat_settings DROP CONSTRAINT IF EXISTS vat_settings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_subscription_id_subscriptions_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_parent_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_initiator_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_approved_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.tickets DROP CONSTRAINT IF EXISTS tickets_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.shipping_settings DROP CONSTRAINT IF EXISTS shipping_settings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sent_messages DROP CONSTRAINT IF EXISTS sent_messages_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.received_messages DROP CONSTRAINT IF EXISTS received_messages_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.password_reset_otps DROP CONSTRAINT IF EXISTS password_reset_otps_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_seller_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_address_id_addresses_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.internal_chats DROP CONSTRAINT IF EXISTS internal_chats_sender_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.internal_chats DROP CONSTRAINT IF EXISTS internal_chats_receiver_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.faqs DROP CONSTRAINT IF EXISTS faqs_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_carts_id_fk;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.whatsapp_settings DROP CONSTRAINT IF EXISTS whatsapp_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.vat_settings DROP CONSTRAINT IF EXISTS vat_settings_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.vat_settings DROP CONSTRAINT IF EXISTS vat_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.tickets DROP CONSTRAINT IF EXISTS tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_settings DROP CONSTRAINT IF EXISTS shipping_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.sent_messages DROP CONSTRAINT IF EXISTS sent_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.received_messages DROP CONSTRAINT IF EXISTS received_messages_whatsi_user_unique;
ALTER TABLE IF EXISTS ONLY public.received_messages DROP CONSTRAINT IF EXISTS received_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_otps DROP CONSTRAINT IF EXISTS password_reset_otps_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_unique;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.internal_chats DROP CONSTRAINT IF EXISTS internal_chats_pkey;
ALTER TABLE IF EXISTS ONLY public.faqs DROP CONSTRAINT IF EXISTS faqs_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.carts DROP CONSTRAINT IF EXISTS carts_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_token_settings DROP CONSTRAINT IF EXISTS ai_token_settings_provider_unique;
ALTER TABLE IF EXISTS ONLY public.ai_token_settings DROP CONSTRAINT IF EXISTS ai_token_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.addresses DROP CONSTRAINT IF EXISTS addresses_pkey;
DROP TABLE IF EXISTS public.whatsapp_settings;
DROP TABLE IF EXISTS public.vat_settings;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_subscriptions;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.tickets;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.shipping_settings;
DROP TABLE IF EXISTS public.sent_messages;
DROP TABLE IF EXISTS public.received_messages;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.password_reset_otps;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.internal_chats;
DROP TABLE IF EXISTS public.faqs;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.carts;
DROP TABLE IF EXISTS public.cart_items;
DROP TABLE IF EXISTS public.ai_token_settings;
DROP TABLE IF EXISTS public.addresses;
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
23af63f3-4552-4ffb-b8f9-3701993de334	گوشی‌های هوشمند	انواع گوشی‌های هوشمند اندروید و آیفون	\N	76c0fd06-0452-4921-b0ef-36088b1e1df4	0	t	2025-10-21 20:36:56.803349	2025-10-21 20:36:56.803349
9253ceb5-93c8-41c8-8cbc-59772e172d4c	لوازم جانبی موبایل	کیف، کاور، محافظ صفحه و سایر لوازم جانبی	\N	76c0fd06-0452-4921-b0ef-36088b1e1df4	1	t	2025-10-21 20:36:56.803349	2025-10-21 20:36:56.803349
c92ed01c-7284-4a33-b46b-1259ef912473	تبلت و آیپد	انواع تبلت‌های اندروید و آیپد اپل	\N	76c0fd06-0452-4921-b0ef-36088b1e1df4	2	t	2025-10-21 20:36:56.803349	2025-10-21 20:36:56.803349
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
30161802-0be2-42ba-9161-e88a0a43336a	76c0fd06-0452-4921-b0ef-36088b1e1df4	آیفون 15 پرو مکس	گوشی آیفون 15 پرو مکس با ظرفیت 256 گیگابایت، رنگ طلایی	23af63f3-4552-4ffb-b8f9-3701993de334	/uploads/iphone15-pro-max.png	5	45000000.00	43000000.00	t	2025-10-21 20:36:56.822556
5d601761-d4dd-4f08-a08c-41f675a6a687	76c0fd06-0452-4921-b0ef-36088b1e1df4	سامسونگ گلکسی S24 اولترا	گوشی سامسونگ گلکسی S24 اولترا با ظرفیت 512 گیگابایت	23af63f3-4552-4ffb-b8f9-3701993de334	/uploads/samsung-s24-ultra.png	8	35000000.00	33500000.00	t	2025-10-21 20:36:56.822556
6781dc57-2540-4486-ad2c-e3bf50a5cfd3	76c0fd06-0452-4921-b0ef-36088b1e1df4	کاور چرمی آیفون	کاور چرمی اصل برای آیفون 15 سری، رنگ قهوه‌ای	9253ceb5-93c8-41c8-8cbc-59772e172d4c	/uploads/iphone-case.png	20	350000.00	299000.00	t	2025-10-21 20:36:56.822556
6fe78bd0-6715-43a2-87c7-5070322eaf9f	76c0fd06-0452-4921-b0ef-36088b1e1df4	محافظ صفحه شیشه‌ای	محافظ صفحه شیشه‌ای ضد ضربه برای انواع گوشی	9253ceb5-93c8-41c8-8cbc-59772e172d4c	/uploads/screen-protector.png	50	120000.00	95000.00	t	2025-10-21 20:36:56.822556
4c826dc0-e7f4-40ba-b574-2b692b6b9f2c	76c0fd06-0452-4921-b0ef-36088b1e1df4	آیپد پرو 12.9 اینچ	تبلت آیپد پرو 12.9 اینچ نسل پنجم با چیپ M2	c92ed01c-7284-4a33-b46b-1259ef912473	/uploads/ipad-pro.png	3	28000000.00	26500000.00	t	2025-10-21 20:36:56.822556
07099998-089b-4995-810b-3be381256948	76c0fd06-0452-4921-b0ef-36088b1e1df4	تبلت سامسونگ گلکسی Tab S9	تبلت سامسونگ گلکسی Tab S9 با صفحه 11 اینچ	c92ed01c-7284-4a33-b46b-1259ef912473	/uploads/samsung-tab-s9.png	6	18000000.00	17200000.00	t	2025-10-21 20:36:56.822556
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
9881b242-0519-4177-8cda-48f9229270ed	اشتراک رایگان	اشتراک پیش‌فرض رایگان 7 روزه	\N	user_level_1	0.00	\N	monthly	{"دسترسی پایه به سیستم","پشتیبانی محدود","7 روز استفاده رایگان"}	t	t	2025-10-21 20:36:56.555221
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
4b6b935f-855f-4c40-ab97-c1a3860bec1a	c6d2f586-864d-4203-8ff0-145df2c934df	9881b242-0519-4177-8cda-48f9229270ed	active	2025-10-21 20:51:42.274	2025-10-28 20:51:42.274	7	t	2025-10-21 20:51:42.275097	2025-10-21 20:51:42.275097
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, first_name, last_name, email, phone, whatsapp_number, whatsapp_token, password, google_id, role, parent_user_id, profile_picture, is_whatsapp_registered, welcome_message, created_at) FROM stdin;
76c0fd06-0452-4921-b0ef-36088b1e1df4	test_seller	علی	فروشنده تستی	test@seller.com	09111234567	09111234567	\N	$2b$10$FnuD7.kfJLf.gwveq6LWmOu05gn5g.dLRv2pdk8tLl/GXnLIag1IS	\N	user_level_1	\N	\N	f	\N	2025-10-21 20:36:56.785258
00dbf168-4f1b-4462-ac6b-2be2d9285ef4	ehsan	احسان	مدیر	ehsan@admin.com	989135621232	\N	\N	$2b$10$itzPUih3uBiZRKbSQhpzMeS4zIiBZc7JzZUKef8eD6ahPnh9CGTMy	\N	admin	\N	\N	f	\N	2025-10-21 20:36:56.786514
c6d2f586-864d-4203-8ff0-145df2c934df	09135621232	احسان	باباگلی	temp_1761079902265@level2.local	09135621232	\N	\N	$2b$10$7.hEP.vuCWukl88Vn.b2Z.QfdvTjKMzbpxw488Q/lG4c21GaSkEfe	\N	user_level_2	76c0fd06-0452-4921-b0ef-36088b1e1df4	\N	f	\N	2025-10-21 20:51:42.267743
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

