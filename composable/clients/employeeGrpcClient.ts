import {
  createChannel,
  createClientFactory,
  Metadata,
  type Channel,
} from "nice-grpc-web";
import {
  EmployeeServicesDefinition,
  type EmployeeServicesClient,
} from "~/composable/protobuf/frontend/employee_services";
enum EmployeeType {
  DOCTOR,
  STAFF,
  OTHER = -1,
}
export default class EmployeeGRPC {
  private static instance: EmployeeGRPC | null = null;
  private readonly grpcConnection: EmployeeServicesClient;
  // TODO: find a way to correctly default
  private type: EmployeeType = EmployeeType.OTHER;
  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.grpcConnection = this.createEmployeesGrpcClient(url);
  }

  /**
   * Gets the singleton instance of PatientGRPC.
   * @param {string} url URL of the gRPC server (only used when creating a new instance).
   * @returns {EmployeeGRPC} The singleton instance.
   */
  public static getInstance(url?: string): EmployeeGRPC {
    if (!EmployeeGRPC.instance && !url)
      throw new Error(
        "EmployeeGRPC has not been initialized, usage: EmployeeGRPC.getInstance(url)",
      );
    if (!EmployeeGRPC.instance && url) {
      EmployeeGRPC.instance = new EmployeeGRPC(url);
    }

    // Same as AuthGRPC, the compiler is not sure that the object is
    // not null.
    return EmployeeGRPC.instance!;
  }

  /**
   * This function creates a gRPC connection to a particular url.
   * @param {string} url URL of the gRPC server.
   * @returns {EmployeeServicesClient} Connection to the gRPC server.
   * @throws {Error} Throws an error if JWT is missing in the auth store.
   */
  private createEmployeesGrpcClient(url: string): EmployeeServicesClient {
    const channel: Channel = createChannel(url);
    const authStore = useAuthStore();
    const token = authStore.getAccessToken();
    if (!token) {
      throw new Error("Error: JWT is missing.");
    }
    if (!authStore.isValidToken()) {
      throw new Error("Error: JWT is invalid.");
    }
    return createClientFactory()
      .use((call, options) =>
        call.next(call.request, {
          ...options,
          metadata: Metadata(options.metadata).set(
            "Authorization",
            `Bearer ${token}`,
          ),
        }),
      )
      .create(EmployeeServicesDefinition, channel);
  }
}
