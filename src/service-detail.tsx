import { Action, ActionPanel, Color, Detail, Icon } from "@raycast/api";
import { ServiceWithProject, isRepositoryDeployment } from "./types";

const statusColors: Record<string, Color> = {
  live: Color.Green,
  pending: Color.Yellow,
  failed: Color.Red,
  suspended: Color.Orange,
  deleting: Color.SecondaryText,
};

function getPrimaryDomain(service: ServiceWithProject): string | undefined {
  if (service.network.customDomains?.length) {
    return service.network.customDomains[0].domain;
  }
  return service.network.managedDomain;
}

function getDomainUrl(domain: string, protocol?: string): string {
  const scheme = protocol === "tcp" || protocol === "udp" ? "http" : "https";
  return `${scheme}://${domain}`;
}

export default function ServiceDetail({ service }: { service: ServiceWithProject }) {
  const isRepo = isRepositoryDeployment(service.deployment);
  const primaryDomain = getPrimaryDomain(service);

  const markdown = `# ${service.name}

**Project:** ${service.projectName}
**Status:** ${service.status}

## Deployment
${isRepo ? `**Repository:** ${service.deployment.url}` : `**Image:** ${service.deployment.url}`}
${isRepo && "branch" in service.deployment && service.deployment.branch ? `**Branch:** ${service.deployment.branch}` : ""}

${primaryDomain ? `## Domain\n[${primaryDomain}](${getDomainUrl(primaryDomain, service.network.protocol)})` : ""}
`;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Status">
            <Detail.Metadata.TagList.Item
              text={service.status}
              color={statusColors[service.status] ?? Color.SecondaryText}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Project" text={service.projectName} />
          <Detail.Metadata.Label
            title="Created"
            text={new Date(service.createdAt).toLocaleDateString()}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Deployment Type" text={isRepo ? "Repository" : "Image"} />
          <Detail.Metadata.Label title="Source" text={service.deployment.url} />
          {isRepo && "branch" in service.deployment && service.deployment.branch && (
            <Detail.Metadata.Label title="Branch" text={service.deployment.branch} />
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Public" text={service.network.public ? "Yes" : "No"} />
          {service.network.protocol && (
            <Detail.Metadata.Label title="Protocol" text={service.network.protocol} />
          )}
          {service.network.managedDomain && (
            <Detail.Metadata.Link
              title="Managed Domain"
              text={service.network.managedDomain}
              target={getDomainUrl(service.network.managedDomain, service.network.protocol)}
            />
          )}
          {service.network.internalDomain && (
            <Detail.Metadata.Label title="Internal Domain" text={service.network.internalDomain} />
          )}
          {service.network.customDomains && service.network.customDomains.length > 0 && (
            <Detail.Metadata.TagList title="Custom Domains">
              {service.network.customDomains.map((cd) => (
                <Detail.Metadata.TagList.Item key={cd.id} text={cd.domain} color={Color.Blue} />
              ))}
            </Detail.Metadata.TagList>
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          {primaryDomain && (
            <Action.OpenInBrowser
              title="Open Primary Domain"
              url={getDomainUrl(primaryDomain, service.network.protocol)}
            />
          )}
          {service.network.managedDomain && primaryDomain !== service.network.managedDomain && (
            <Action.OpenInBrowser
              title="Open Managed Domain"
              url={getDomainUrl(service.network.managedDomain, service.network.protocol)}
            />
          )}
          {service.network.customDomains?.map((cd) => (
            <Action.OpenInBrowser
              key={cd.id}
              title={`Open ${cd.domain}`}
              url={getDomainUrl(cd.domain, service.network.protocol)}
            />
          ))}
          {primaryDomain && (
            <Action.CopyToClipboard
              title="Copy Primary Domain"
              content={primaryDomain}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          )}
          {isRepo && (
            <Action.OpenInBrowser
              title="Open Repository"
              url={service.deployment.url}
              icon={Icon.Code}
              shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
