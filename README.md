# DealHub — Your Affiliate Product Storefront

A clean, mobile-friendly website to showcase products (Amazon and others) with your
affiliate links, plus an admin panel to manage products and see click activity.

Your database is **already set up and live** (hosted on Neon). You don't need to create
one — just follow the steps below to put the website online.

---

## What you have

- `app/` — the website pages and admin panel (Next.js)
- `lib/` — database and login helper code
- A live Postgres database, already created, with empty tables ready for your products

---

## Step 1 — Create a free GitHub account (skip if you have one)

Go to https://github.com/signup and create an account.

## Step 2 — Put this code on GitHub

The easiest way as a beginner:

1. Go to https://github.com/new, name the repository `dealhub`, keep it **Private**, click **Create repository**.
2. On the next page, click **"uploading an existing file"**.
3. Unzip the file I gave you, then drag the **contents** of the `dealhub` folder into the browser upload box (drag everything except the `node_modules` folder if it exists — it shouldn't, since it's excluded).
4. Click **Commit changes**.

(If you're comfortable with git/terminal instead, the usual `git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push` works too.)

## Step 3 — Deploy to Vercel

1. Go to https://vercel.com/signup and sign up using your **GitHub account** (this makes step 4 seamless).
2. Click **"Add New..." → "Project"**.
3. Find and import the `dealhub` repository you just created.
4. Before clicking Deploy, open **"Environment Variables"** and add these three
   (copy exactly as shown — this connects to your already-created database):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_10FOoLvMuNTQ@ep-lucky-block-az65ncmq-pooler.c-3.ap-southeast-1.aws.neon.tech/dealhub?channel_binding=require&sslmode=require` |
   | `JWT_SECRET` | `f2c396b1da07c7b9b8cecc8fd878bbeca4da9264f78331233a8cc162026d970e` |
   | `SETUP_KEY` | `2c3856e4e0e0a4cc068a6c3a171b1740` |

5. Click **Deploy**. Wait ~1-2 minutes.
6. You'll get a live URL like `https://dealhub-yourname.vercel.app` — that's your real, live website. 🎉

> ⚠️ Keep `SETUP_KEY` and `JWT_SECRET` private — don't share them or commit them to a
> public repo. Anyone with `SETUP_KEY` could create an admin account on your site.

## Step 4 — Create your admin account (do this once)

1. Visit `https://YOUR-SITE.vercel.app/admin/setup`
2. Enter a username, a password (8+ characters), and paste the `SETUP_KEY` from above.
3. Click **Create account**. You'll be sent to the login page — log in with what you just created.
4. This setup page automatically locks itself after your first admin account is created, so no one else can use it.

## Step 5 — Add your first products

1. Go to `https://YOUR-SITE.vercel.app/admin`
2. Click **Products → + Add Product**
3. Fill in the name, description, an image URL (you can right-click any Amazon product
   image → "Copy image address"), price, and — most importantly — your **affiliate URL**.

### Getting your Amazon affiliate link
1. Join the **Amazon Associates** program: https://affiliate-program.amazon.com
2. Once approved, use their **SiteStripe** toolbar (appears at the top of Amazon while
   logged in as an associate) to get a short affiliate link for any product.
3. Paste that link into the "Affiliate / Product URL" field when adding a product here.

When a visitor clicks **Buy Now** on your site, they're redirected straight to that link,
and the click is logged automatically — you'll see it on your Dashboard.

---

## Everyday use

- **Add/edit/hide products:** `/admin/products`
- **See stats & recent activity:** `/admin` (dashboard)
- **Your public site:** `/` — this is what you'd share on Instagram/YouTube/wherever

## Custom domain (optional, later)

In Vercel: Project → Settings → Domains → add your own domain (e.g. `dealhub.com`) and
follow the DNS instructions Vercel gives you.

## A note on security & scaling

- Passwords are hashed (never stored in plain text).
- The admin panel is protected — only someone logged in can add/edit/delete products.
- This free-tier setup easily handles a growing site. If you get very large traffic later,
  you may want to add image hosting (like Cloudinary) instead of raw image URLs, and
  consider a paid Neon/Vercel plan.

## If something breaks

- **Blank page / error on the live site:** check Vercel → your project → "Deployments" →
  click the latest one → "Logs" to see what went wrong.
- **Can't log into admin:** make sure you completed Step 4, and that you're using the
  exact username/password you set.
- Feel free to come back and ask me to fix or add anything — I can also help you extend
  this later (better SEO, newsletter signup, more admin features, etc).
