import { getPreferenceValues } from "@raycast/api";
import { LogEntry, Preferences, Project, Service, ServiceWithProject } from "./types";

const BASE_URL = "https://ctrl.sliplane.io";

async function apiFetch<T>(path: string): Promise<T> {
  const { apiToken } = getPreferenceValues<Preferences>();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid API token. Please check your Sliplane API token in extension preferences.");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/v0/projects");
}

export async function getServices(projectId: string): Promise<Service[]> {
  return apiFetch<Service[]>(`/v0/projects/${projectId}/services`);
}

export async function getServiceLogs(projectId: string, serviceId: string): Promise<LogEntry[]> {
  return apiFetch<LogEntry[]>(`/v0/projects/${projectId}/services/${serviceId}/logs`);
}

export async function getAllServices(): Promise<ServiceWithProject[]> {
  const projects = await getProjects();

  const servicesPerProject = await Promise.all(
    projects.map(async (project) => {
      const services = await getServices(project.id);
      return services.map((service) => ({
        ...service,
        projectName: project.name,
      }));
    }),
  );

  return servicesPerProject.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
