# Sliplane

[Sliplane](https://sliplane.io) is a simple container hosting platform that lets you deploy Docker containers and Git repositories in seconds. It provides managed domains, automatic HTTPS, custom domains, internal networking, and a clean dashboard to monitor your running services across multiple projects.

## Installation

You will need to have [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/) installed.

1. Clone this repo `git clone https://github.com/yulei-chen/raycast-sliplane`
2. Go to the folder `cd raycast-sliplane`
3. Install dependencies `npm install`
4. Go to Raycast, run `Import Extension` and select the folder
5. Start the dev server `npm run dev`

## Setup

1. Open the extension in Raycast.
2. When prompted, enter your **Sliplane API Token**. You can create one in your Sliplane Dashboard under **Team Settings → API Tokens**. The token follows the format `api_rw_org_xxx_secret`.

## Commands

### Search Services

Browse and search all your Sliplane services across every project in one place.

- **Search** services by name using the search bar.
- **Select** a service to see its details in the sidebar: status, project, deployment source, branch, network visibility, protocol, managed domain, internal domain, and custom domains.
- **Actions available on each service:**
  - `Open Domain` — opens the service's domain in your browser (`⌘ O`)
  - `Open Service Settings` — jumps directly to the service settings page in the Sliplane dashboard
  - `Open Repository` — opens the linked Git repository (`⌘ R`, repository deployments only)
  - `Copy Image Source` — copies the Docker image reference (image deployments only)
  - `Copy Branch` — copies the deployed branch name (repository deployments only)
  - `Copy Internal Domain` — copies the internal domain for service-to-service communication
  - `Open Extension Preferences` — opens the Raycast preferences for this extension

### Search Blog Posts

Quickly open the [Sliplane blog](https://sliplane.io/blog), optionally filtered by a keyword.

- Run the command with no argument to open the blog home page.
- Type a **keyword** as an argument (e.g. `docker`) to open the blog pre-filtered to that search term.
