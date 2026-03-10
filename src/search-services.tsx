import { Action, ActionPanel, Color, Icon, List, openExtensionPreferences, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { getAllServices } from "./api";
import ServiceDetail from "./service-detail";
import { ServiceWithProject } from "./types";

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

export default function Command() {
  const [page, setPage] = useState(1);

  const { data: services, isLoading, error } = usePromise(getAllServices, [], {
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
    <List isLoading={isLoading} searchBarPlaceholder="Search services...">
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
            subtitle={domain}
            accessories={[
              { tag: { value: service.status, color: statusStyle.color } },
              { text: service.projectName, icon: Icon.Folder },
            ]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="View Details"
                  icon={Icon.Eye}
                  target={<ServiceDetail service={service} />}
                />
                {domain && (
                  <Action.OpenInBrowser
                    title="Open Domain"
                    url={getDomainUrl(domain, service.network.protocol)}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                  />
                )}
                {domain && (
                  <Action.CopyToClipboard
                    title="Copy Domain"
                    content={domain}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                )}
                <Action
                  title="Open Extension Preferences"
                  icon={Icon.Gear}
                  onAction={openExtensionPreferences}
                />
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
