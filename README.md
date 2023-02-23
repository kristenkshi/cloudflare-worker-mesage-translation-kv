# Cloudflare Worker for Message Translation and Storage

This Cloudflare Worker allows you to accept a POST request containing a message in any language, translates it to English and Chinese using the Google Cloud Platform Translation service, and then stores the original message, the name of the original language, the English translation, and the Chinese translation in a Workers KV.

## Prerequisites

1. **Cloudflare Account**: You need to have a Cloudflare account to use Cloudflare Workers and Workers KV. See [here](https://dash.cloudflare.com/sign-up) to sign up for a Cloudflare account.

2. **Google Cloud Translation API Credentials**: Obtain your Google Cloud Translation API key from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and ensure that it has access to the Translation API.

3. **Node.js**: You need Node.js installed on your local machine to use Cloudflare's wrangler CLI. To install Node.js via package manager, see [here](https://nodejs.org/en/download/package-manager).

## Setup

### Step 1: Install Cloudflare Wrangler

If you don't have Cloudflare's wrangler CLI installed, you can install it using npm (Node Package Manager):

```bash
npm install -g @cloudflare/wrangler
```

### Step 2: Configure Wrangler

Run the following command to set up your wrangler configuration:

```bash
wrangler config
```

This command will prompt you to log in to your Cloudflare account and set up your wrangler configuration.

### Step 3: Clone this repository and navigate to it

Clone (download) this repository and change the directory to the repository:

```bash
git clone https://github.com/kristenkshi/cloudflare-worker-mesage-translation-kv.git
cd cloudflare-worker-mesage-translation-kv
```

### Step 4: Add Google Cloud Translation API Key

Replace `'YOUR_GOOGLE_TRANSLATION_API_KEY'` in the worker.js file with your actual Google Cloud Translation API key.

### Step 5: Initialize Workers KV

Initialize Workers KV for your Cloudflare Worker project:

```bash
wrangler kv:namespace create "KV_NAMESPACE"
```

Replace `"KV_NAMESPACE"` with a suitable name for your Workers KV namespace.

### Step 6: Configure Wrangler Toml

Create a `wrangler.toml` file in your project directory with the following content:

```toml
name = "mesage-translation-worker"
type = "webpack"
account_id = "<YOUR_CLOUDFLARE_ACCOUNT_ID>"
workers_dev = true

[vars]
GOOGLE_TRANSLATION_API_KEY = "YOUR_GOOGLE_TRANSLATION_API_KEY"

kv_namespaces = [
  { binding = "KV_NAMESPACE_ID", id = "<KV_NAMESPACE_ID>" }
]

[site]
bucket = "./dist"
entry-point = "worker"
```

Replace `<YOUR_CLOUDFLARE_ACCOUNT_ID>` with your actual Cloudflare account ID, and `<KV_NAMESPACE_ID>` with the ID of the Workers KV namespace you created in the previous steps.

### Step 7: Build and Deploy the Cloudflare Worker

Build and deploy your Cloudflare Worker using wrangler:

```bash
wrangler build
wrangler publish
```

This will build the project and publish it to your Cloudflare account.

## Usage

To use the Cloudflare Worker, send a POST request to the URL of your published Cloudflare Worker endpoint.

**NOTE: There is no authentication on this endpoint, so anyone with the URL can send a POST request to it. Please ensure the Cloudflare Worker and its endpoint are behind a firewall in your environment.**

The request should contain a JSON payload with the following structure:

```json
{
  "message": "Your message in any language"
}
```

The Worker will then translate the message to English and Chinese using the Google Cloud Translation API. The original message, the name of the original language, the English translation, and the Chinese translation will be stored in Workers KV.

## Notes

* **Please ensure the Cloudflare Worker and its endpoint are behind a suitable firewall in your environment as there is no authentication on the endpoint. That means anyone with the URL can send a POST request to it if it is not behind a firewall.**
* This setup assumes you have already set up Workers KV and obtained your Google Cloud Translation API key.
* For more information on Cloudflare Workers and wrangler CLI, refer to the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers) and [wrangler CLI documentation](https://github.com/cloudflare/wrangler-legacy).
