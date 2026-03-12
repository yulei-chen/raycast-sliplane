import { Action, ActionPanel, Color, Icon, List, openExtensionPreferences, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { getAllServices } from "./api";
import { isRepositoryDeployment, ServiceWithProject } from "./types";

const PAGE_SIZE = 10;

const statusIcons: Record<string, { icon: Icon; color: Color }> = {
  live: { icon: Icon.CircleFilled, color: Color.Green },
  pending: { icon: Icon.Clock, color: Color.Yellow },
  failed: { icon: Icon.XMarkCircleFilled, color: Color.Red },
  suspended: { icon: Icon.PauseFilled, color: Color.Orange },
  deleting: { icon: Icon.Trash, color: Color.SecondaryText },
};

function getServiceDomain(service: ServiceWithProject): string | undefined {
  if (service.network.customDomains?.length) {
    return service.network.customDomains[0].domain;
  }
  return service.network.managedDomain;
}

function getDomainUrl(domain: string, protocol?: string): string {
  const scheme = protocol === "tcp" || protocol === "udp" ? "http" : "https";
  return `${scheme}://${domain}`;
}

function ServiceMetadata({ service }: { service: ServiceWithProject }) {
  const isRepo = isRepositoryDeployment(service.deployment);
  const statusColor = statusIcons[service.status]?.color ?? Color.SecondaryText;
  const statusIcon = statusIcons[service.status]?.icon ?? Icon.QuestionMark;

  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.TagList title="Status">
            <List.Item.Detail.Metadata.TagList.Item text={service.status} color={statusColor} icon={statusIcon} />
          </List.Item.Detail.Metadata.TagList>
          <List.Item.Detail.Metadata.Label title="Project" text={service.projectName} icon={Icon.Folder} />
          <List.Item.Detail.Metadata.Label
            title="Created"
            text={new Date(service.createdAt).toLocaleDateString()}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.TagList title="Deployment">
            <List.Item.Detail.Metadata.TagList.Item
              text={isRepo ? "Repository" : "Image"}
              color={isRepo ? Color.Purple : Color.Blue}
              icon={isRepo ? Icon.Code : Icon.Box}
            />
          </List.Item.Detail.Metadata.TagList>
          {isRepo ? (
            <List.Item.Detail.Metadata.Link title="Source" text={service.deployment.url} target={service.deployment.url} />
          ) : (
            <List.Item.Detail.Metadata.Label title="Source" text={service.deployment.url} />
          )}
          {isRepo && "branch" in service.deployment && service.deployment.branch && (
            <List.Item.Detail.Metadata.Label
              title="Branch"
              text={service.deployment.branch}
            />
          )}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.TagList title="Visibility">
            <List.Item.Detail.Metadata.TagList.Item
              text={service.network.public ? "Public" : "Private"}
              color={service.network.public ? Color.Green : Color.Orange}
              icon={service.network.public ? Icon.Globe : Icon.Lock}
            />
          </List.Item.Detail.Metadata.TagList>
          {service.network.protocol && (
            <List.Item.Detail.Metadata.Label
              title="Protocol"
              text={service.network.protocol.toUpperCase()}
              icon={Icon.Network}
            />
          )}
          {service.network.managedDomain && (
            <List.Item.Detail.Metadata.Link
              title="Managed Domain"
              text={service.network.managedDomain}
              target={getDomainUrl(service.network.managedDomain, service.network.protocol)}
            />
          )}
          {service.network.internalDomain && (
            <List.Item.Detail.Metadata.Label
              title="Internal Domain"
              text={service.network.internalDomain}
            />
          )}
          {service.network.customDomains && service.network.customDomains.length > 0 && (
            <List.Item.Detail.Metadata.TagList title="Custom Domains">
              {service.network.customDomains.map((cd) => (
                <List.Item.Detail.Metadata.TagList.Item key={cd.id} text={cd.domain} color={Color.Blue} icon={Icon.Globe} />
              ))}
            </List.Item.Detail.Metadata.TagList>
          )}
        </List.Item.Detail.Metadata>
      }
    />
  );
}

export default function Command() {
  const [page, setPage] = useState(1);

  const {
    data: services,
    isLoading,
    error,
  } = usePromise(getAllServices, [], {
    onError: async (err) => {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load services",
        message: err.message,
        primaryAction: {
          title: "Open Preferences",
          onAction: () => openExtensionPreferences(),
        },
      });
    },
  });

  const visibleServices = services?.slice(0, page * PAGE_SIZE) ?? [];
  const hasMore = services ? visibleServices.length < services.length : false;

  return (
    <List isLoading={isLoading} isShowingDetail searchBarPlaceholder="Search services...">
      {!isLoading && !error && services?.length === 0 && (
        <List.EmptyView
          title="No Services Found"
          description="You don't have any services yet, or your API token may be incorrect."
          icon={Icon.Cloud}
          actions={
            <ActionPanel>
              <Action title="Open Preferences" onAction={openExtensionPreferences} icon={Icon.Gear} />
            </ActionPanel>
          }
        />
      )}
      {visibleServices.map((service) => {
        const domain = getServiceDomain(service);
        const statusStyle = statusIcons[service.status] ?? { icon: Icon.QuestionMark, color: Color.SecondaryText };

        return (
          <List.Item
            key={service.id}
            icon={{ source: statusStyle.icon, tintColor: statusStyle.color }}
            title={service.name}
            // accessories={[{ tag: { value: service.status, color: statusStyle.color } }]}
            detail={<ServiceMetadata service={service} />}
            actions={
              <ActionPanel>
                {domain && (
                  <Action.OpenInBrowser
                    title="Open Domain"
                    url={getDomainUrl(domain, service.network.protocol)}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                    icon={Icon.Globe}
                  />
                )}
                <Action.OpenInBrowser
                  title="Open Service Settings"
                  url={`https://sliplane.io/app/projects/${service.projectId}/services/${service.id}`}
                  icon={Icon.Gear}
                />
                {isRepositoryDeployment(service.deployment) && (
                  <Action.OpenInBrowser
                    title="Open Repository"
                    url={service.deployment.url}
                    icon={Icon.Code}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                )}
                {!isRepositoryDeployment(service.deployment) && (
                  <Action.CopyToClipboard title="Copy Image Source" content={service.deployment.url} />
                )}
                {isRepositoryDeployment(service.deployment) &&
                  "branch" in service.deployment &&
                  service.deployment.branch && (
                    <Action.CopyToClipboard title="Copy Branch" content={service.deployment.branch} />
                  )}
                {service.network.internalDomain && (
                  <Action.CopyToClipboard title="Copy Internal Domain" content={service.network.internalDomain} />
                )}
                <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
              </ActionPanel>
            }
          />
        );
      })}
      {hasMore && (
        <List.Item
          key="show-more"
          icon={Icon.Ellipsis}
          title="Show More"
          subtitle={`Showing ${visibleServices.length} of ${services?.length} services`}
          actions={
            <ActionPanel>
              <Action title="Show More" icon={Icon.ArrowDown} onAction={() => setPage((p) => p + 1)} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
