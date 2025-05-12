import {
  createChannel,
  createClientFactory,
  Metadata,
  type Channel,
} from "nice-grpc-web";
import {
  CreateDoctorResponse,
  CreatePatientResponse,
  CreateStaffResponse,
  EmployeeServicesDefinition,
  GetAllDoctorsResponse,
  GetAllPatientsResponse,
  GetAllWardResponse,
  ModifyDoctorResponse,
  ModifyPatientResponse,
  ModifyStaffResponse,
  type EmployeeServicesClient,
} from "~/composable/protobuf/frontend/employee_services";
import type {
  Doctor,
  Patient,
  Staff,
} from "~/composable/protobuf/frontend/user";

/** Enum representing the type of employee. */
enum EmployeeType {
  DOCTOR,
  STAFF,
  OTHER = -1,
}

/** Class representing employee-related gRPC services using a singleton pattern. */
export default class EmployeeGRPC {
  private static instance: EmployeeGRPC | null = null;
  private readonly grpcConnection: EmployeeServicesClient;

  // TODO: set correct type on init
  private type: EmployeeType = EmployeeType.OTHER;

  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.grpcConnection = this.createEmployeesGrpcClient(url);
  }

  /**
   * Gets the singleton instance of EmployeeGRPC.
   * @param {string?} url URL of the gRPC server (required for first call).
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

    return EmployeeGRPC.instance!;
  }

  /**
   * Creates a gRPC connection to the employee services.
   * @param {string} url URL of the gRPC server.
   * @returns {EmployeeServicesClient} Connection to the employee gRPC services.
   * @throws {Error} If the JWT is missing or invalid.
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

  /**
   * Retrieves all doctors.
   * @returns {Promise<GetAllDoctorsResponse>} Promise resolving to the list of doctors.
   */
  getAllDoctors(): Promise<GetAllDoctorsResponse> {
    return this.grpcConnection.getAllDoctors({});
  }

  /**
   * Retrieves all patients.
   * @returns {Promise<GetAllPatientsResponse>} Promise resolving to the list of patients.
   */
  getAllPatients(): Promise<GetAllPatientsResponse> {
    return this.grpcConnection.getAllPatients({});
  }

  /**
   * Retrieves all wards.
   * @returns {Promise<GetAllWardResponse>} Promise resolving to the list of wards.
   */
  getAllWards(): Promise<GetAllWardResponse> {
    return this.grpcConnection.getAllWard({});
  }

  /**
   * Creates a new doctor record.
   * @param {Doctor} doctor Doctor object to create.
   * @returns {Promise<CreateDoctorResponse>} Server response.
   */
  createDoctor(doctor: Doctor): Promise<CreateDoctorResponse> {
    return this.grpcConnection.createDoctor(doctor);
  }

  /**
   * Edits an existing doctor record.
   * @param {Doctor} newDoctorDetails Updated doctor information.
   * @returns {Promise<ModifyDoctorResponse>} Server response.
   */
  editDoctor(newDoctorDetails: Doctor): Promise<ModifyDoctorResponse> {
    return this.grpcConnection.modifyDoctor(newDoctorDetails);
  }

  /**
   * Creates a new patient record.
   * @param {Patient} patient Patient object to create.
   * @returns {Promise<CreatePatientResponse>} Server response.
   */
  createPatient(patient: Patient): Promise<CreatePatientResponse> {
    return this.grpcConnection.createPatient(patient);
  }

  /**
   * Edits an existing patient record.
   * @param {Patient} newPatientDetails Updated patient information.
   * @returns {Promise<ModifyPatientResponse>} Server response.
   */
  editPatient(newPatientDetails: Patient): Promise<ModifyPatientResponse> {
    return this.grpcConnection.modifyPatient(newPatientDetails);
  }

  /**
   * Creates a new staff record.
   * @param {Staff} staff Staff object to create.
   * @returns {Promise<CreateStaffResponse>} Server response.
   */
  createStaff(staff: Staff): Promise<CreateStaffResponse> {
    return this.grpcConnection.createStaff(staff);
  }

  /**
   * Edits an existing staff record.
   * @param {Staff} newStaffDetails Updated staff information.
   * @returns {Promise<ModifyStaffResponse>} Server response.
   */
  editStaff(newStaffDetails: Staff): Promise<ModifyStaffResponse> {
    return this.grpcConnection.modifyStaff(newStaffDetails);
  }
}
