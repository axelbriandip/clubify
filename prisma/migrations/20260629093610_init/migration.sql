-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'SUSPENDED_FOR_NONPAYMENT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('STRIPE', 'MERCADOPAGO', 'MANUAL_TRANSFER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('PLATINUM', 'GOLD', 'SILVER');

-- CreateEnum
CREATE TYPE "PreferredSide" AS ENUM ('LEFT', 'RIGHT', 'AMBIDEXTROUS');

-- CreateEnum
CREATE TYPE "PlayerCategoryStatus" AS ENUM ('REGULAR_PLAYER', 'RESERVE_PLAYER', 'INJURED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'PLAYING', 'POSTPONED', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION_IN', 'SUBSTITUTION_OUT', 'INJURY', 'PENALTY_SAVED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'READ', 'RESPONDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "custom_domain" VARCHAR(255),
    "status" "ClubStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "legal_name" VARCHAR(255),
    "tax_id" VARCHAR(50),
    "billing_email" VARCHAR(255) NOT NULL,
    "general_email" VARCHAR(255),
    "phone" VARCHAR(50),
    "country" VARCHAR(100) NOT NULL,
    "state_province" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_subscriptions" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "plan_type" VARCHAR(50) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "payment_gateway" "PaymentGateway" NOT NULL,
    "gateway_customer_id" VARCHAR(255),
    "gateway_subscription_id" VARCHAR(255),
    "price_amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "person_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(50),
    "avatar_url" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_users" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "previous_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_settings" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "logo_color_url" VARCHAR(500) NOT NULL,
    "logo_white_url" VARCHAR(500),
    "logo_black_url" VARCHAR(500),
    "favicon_url" VARCHAR(500),
    "primary_color" VARCHAR(7) NOT NULL,
    "secondary_color" VARCHAR(7) NOT NULL,
    "accent_color" VARCHAR(7),
    "font_family" VARCHAR(100) NOT NULL,
    "custom_css" TEXT,
    "hero_title" VARCHAR(255),
    "hero_subtitle" VARCHAR(500),
    "hero_cta_text" VARCHAR(100),
    "hero_cta_link" VARCHAR(500),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(100),
    "whatsapp_number" VARCHAR(50),
    "address_text" VARCHAR(255),
    "google_maps_embed_url" TEXT,
    "facebook_url" VARCHAR(500),
    "instagram_url" VARCHAR(500),
    "twitter_x_url" VARCHAR(500),
    "youtube_url" VARCHAR(500),
    "tiktok_url" VARCHAR(500),
    "seo_meta_title" VARCHAR(255),
    "seo_meta_description" TEXT,
    "seo_og_image_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_images" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "title" VARCHAR(255),
    "subtitle" VARCHAR(500),
    "link_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo_color_url" VARCHAR(500) NOT NULL,
    "logo_white_url" VARCHAR(500),
    "logo_black_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "tier" "SponsorTier" NOT NULL DEFAULT 'SILVER',
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_impressions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "image_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(100),
    "date_of_birth" DATE NOT NULL,
    "place_of_birth" VARCHAR(100),
    "nationality" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" VARCHAR(255),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(50),
    "document_id" VARCHAR(50),
    "blood_type" VARCHAR(10),
    "medical_clearance_expiry" DATE,
    "member_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "position" VARCHAR(150) NOT NULL,
    "term_start" DATE,
    "term_end" DATE,
    "photo_square_url" VARCHAR(500),
    "photo_horizontal_url" VARCHAR(500),
    "photo_vertical_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "main_role" VARCHAR(150) NOT NULL,
    "bio" TEXT,
    "photo_square_url" VARCHAR(500),
    "photo_horizontal_url" VARCHAR(500),
    "photo_vertical_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "preferred_foot_hand" "PreferredSide",
    "height_cm" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "previous_club" VARCHAR(255),
    "bio_description" TEXT,
    "photo_square_url" VARCHAR(500),
    "photo_horizontal_url" VARCHAR(500),
    "photo_vertical_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(500),
    "slug" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "discipline_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "age_range" VARCHAR(50),
    "gender" "Gender",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_staff" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "staff_member_id" UUID NOT NULL,
    "role_in_category" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_categories" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "jersey_number" INTEGER,
    "position" VARCHAR(100),
    "status" "PlayerCategoryStatus" NOT NULL DEFAULT 'REGULAR_PLAYER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues_tournaments" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "season" VARCHAR(50),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(50),
    "logo_color_url" VARCHAR(500),
    "logo_white_url" VARCHAR(500),
    "logo_black_url" VARCHAR(500),
    "is_own_club" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "tournament_id" UUID,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "match_date" DATE NOT NULL,
    "match_time" TIME,
    "facility_id" UUID,
    "custom_location_name" VARCHAR(255),
    "custom_location_address" VARCHAR(255),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "home_score" INTEGER,
    "away_score" INTEGER,
    "match_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_lineups" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "is_starter" BOOLEAN NOT NULL DEFAULT true,
    "jersey_number" INTEGER,
    "position_played" VARCHAR(100),
    "minutes_played" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "player_id" UUID,
    "rival_player_name" VARCHAR(150),
    "event_type" "MatchEventType" NOT NULL,
    "match_minute" INTEGER,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "author_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "category" VARCHAR(100),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_albums" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" UUID NOT NULL,
    "album_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "caption" VARCHAR(255),
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_tags" (
    "id" UUID NOT NULL,
    "photo_id" UUID NOT NULL,
    "person_id" UUID,
    "category_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_applications" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "document_id" VARCHAR(50) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255),
    "membership_tier_desired" VARCHAR(100),
    "custom_fields_responses" JSONB,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_custom_domain_key" ON "clubs"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "club_users_club_id_user_id_key" ON "club_users"("club_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_settings_club_id_key" ON "club_settings"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_club_id_slug_key" ON "disciplines"("club_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_staff_category_id_staff_member_id_key" ON "category_staff"("category_id", "staff_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_categories_player_id_category_id_key" ON "player_categories"("player_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_lineups_match_id_player_id_key" ON "match_lineups"("match_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_club_id_slug_key" ON "news"("club_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_club_id_email_key" ON "newsletter_subscribers"("club_id", "email");

-- AddForeignKey
ALTER TABLE "saas_subscriptions" ADD CONSTRAINT "saas_subscriptions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_users" ADD CONSTRAINT "club_users_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_users" ADD CONSTRAINT "club_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_users" ADD CONSTRAINT "club_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_settings" ADD CONSTRAINT "club_settings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_images" ADD CONSTRAINT "hero_images_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_staff" ADD CONSTRAINT "category_staff_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_staff" ADD CONSTRAINT "category_staff_staff_member_id_fkey" FOREIGN KEY ("staff_member_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_categories" ADD CONSTRAINT "player_categories_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_categories" ADD CONSTRAINT "player_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leagues_tournaments" ADD CONSTRAINT "leagues_tournaments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "leagues_tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_albums" ADD CONSTRAINT "photo_albums_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "photo_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_applications" ADD CONSTRAINT "member_applications_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
