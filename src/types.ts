export interface Preferences {
  apiToken: string;
}

export interface Project {
  id: string;
  name: string;
}

export type ServiceStatus = "pending" | "live" | "failed" | "suspended" | "deleting";

export interface CustomDomain {
  domain: string;
  id: string;
}

export interface ServiceNetworkResponse {
  public: boolean;
  protocol?: string;
  managedDomain?: string;
  internalDomain?: string;
  customDomains?: CustomDomain[];
}

export interface RepositoryDeployment {
  url: string;
  dockerfilePath?: string;
  dockerContext?: string;
  autoDeploy?: boolean;
  branch?: string;
}

export interface ImageDeployment {
  url: string;
  registryAuthenticationId?: string;
}

export interface Service {
  id: string;
  name: string;
  serverId: string;
  projectId: string;
  status: ServiceStatus;
  createdAt: string;
  deployment: RepositoryDeployment | ImageDeployment;
  network: ServiceNetworkResponse;
  volumes?: unknown[];
  env?: Record<string, string>;
  healthcheck?: unknown;
  cmd?: string;
}

export interface ServiceWithProject extends Service {
  projectName: string;
}

export interface LogEntry {
  message: string;
  createdAt: string;
}

export function isRepositoryDeployment(
  deployment: RepositoryDeployment | ImageDeployment,
): deployment is RepositoryDeployment {
  return "branch" in deployment || "dockerfilePath" in deployment || "autoDeploy" in deployment;
}
