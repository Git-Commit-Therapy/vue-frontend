import {
  createChannel,
  createClientFactory,
  Metadata,
  type Channel,
} from "nice-grpc-web";
import {
  CreateAppointmentResponse,
  CreateDoctorResponse,
  CreateMedicalEventResponse,
  CreateMedicalExamResponse,
  CreateMedicalInfoResponse,
  CreatePatientResponse,
  CreateStaffResponse,
  EmployeeServicesDefinition,
  GetAllDoctorsResponse,
  GetAllMedicalEventRequest,
  GetAllPatientsResponse,
  GetAllStaffsResponse,
  GetAllWardResponse,
  GetAppointmentsFromDoctorRequest,
  GetAppointmentsFromDoctorResponse,
  ModifyAppointmentResponse,
  ModifyDoctorResponse,
  ModifyMedicalEventResponse,
  ModifyMedicalExamResponse,
  ModifyMedicalInfoResponse,
  ModifyPatientResponse,
  ModifyStaffResponse,
  type EmployeeServicesClient,
} from "~/composable/protobuf/frontend/employee_services";
import type {
  Doctor,
  Patient,
  Staff,
} from "~/composable/protobuf/frontend/user";
import type { MedicalInfo } from "../protobuf/frontend/medical_info";
import type { Appointment } from "../protobuf/frontend/appointment";
import type { MedicalExam } from "../protobuf/frontend/medical_exam";
import type { MedicalEvent } from "../protobuf/frontend/medical_event";
import type { GetAllMedicalExamRequest } from "../protobuf/frontend/patient_services";

/** Enum representing the type of employee. */
enum EmployeeType {
  DOCTOR,
  STAFF,
  UNKNOWN = -1,
}

/** Class representing employee-related gRPC services using a singleton pattern. */
export default class EmployeeGRPC {
  private static instance: EmployeeGRPC | null = null;
  private readonly grpcConnection: EmployeeServicesClient;

  private type: EmployeeType = EmployeeType.UNKNOWN;

  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.grpcConnection = this.createEmployeesGrpcClient(url);
    const tmpRoles: string[] = getUserRoles(useAuthStore().getAccessToken());
    if (tmpRoles.includes("staff")) this.type = EmployeeType.STAFF;
    if (tmpRoles.includes("doctor")) this.type = EmployeeType.DOCTOR;
    // But what if a user has multiple roles? Is it even possible?
    // TODO: check if possible
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
    if (!authStore.isValidToken()) {
      throw new Error("Error: JWT is invalid.");
    }
    return createClientFactory()
      .use((call, options) => {
        const token = authStore.getAccessToken();
        return call.next(call.request, {
          ...options,
          metadata: Metadata(options.metadata).set(
            "Authorization",
            `Bearer ${token}`,
          ),
        });
      })
      .create(EmployeeServicesDefinition, channel);
  }

  /**
   * Retrieves the doctor associated to the JWT.
   * @returns {Promise<Doctor>} Promise resolving to a doctor.
   */
  getDoctor(): Promise<Doctor> {
    return this.grpcConnection.getDoctor({});
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
   * Retrieves all staff.
   * @returns {Promise<GetAllWardResponse>} Promise resolving to the list of staff.
   */
  getAllStaff(): Promise<GetAllStaffsResponse> {
    return this.grpcConnection.getAllStaffs({});
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

  /**
   * Checks if the current user is a staff member.
   * @returns {boolean} True if the user is a staff member, false otherwise.
   */
  isStaff(): boolean {
    return this.type === EmployeeType.STAFF;
  }

  /**
   * Checks if the current user is a doctor.
   * @returns {boolean} True if the user is a doctor, false otherwise.
   */
  isDoctor(): boolean {
    return this.type === EmployeeType.DOCTOR;
  }

  /**
   * Updates a medical information for a given patient.
   * @param {updatedMedicalInfo} updatedMedicalInfo medical information for the patient.
   * @returns {Promise<ModifyMedicalInfoResponse>} Promise containing the status of the request.
   */
  updateMedicalInfo(
    updatedMedicalInfo: MedicalInfo,
  ): Promise<ModifyMedicalInfoResponse> {
    return this.grpcConnection.modifyMedicalInfo(updatedMedicalInfo);
  }

  /**
   * Creates a medical information for a given patient.
   * @param {MedicalInfo} info medical information for the patient.
   * @returns {Promise<CreateMedicalInfoResponse>} Promise containing the status of the request.
   */
  createMedicalInfo(info: MedicalInfo): Promise<CreateMedicalInfoResponse> {
    return this.grpcConnection.createMedicalInfo(info);
  }

  /**
   * Creates an appointment for a given patient.
   * @param {Appointment} appointment Appointment details including staff, doctor, and patient.
   * @returns {Promise<CreateAppointmentResponse>} Promise containing the status of the request.
   */
  createAppointment(
    appointment: Appointment,
  ): Promise<CreateAppointmentResponse> {
    return this.grpcConnection.createAppointment(appointment);
  }

  /**
   * Updates an existing appointment.
   * @param {Appointment} updatedAppointment Updated appointment details.
   * @returns {Promise<ModifyAppointmentResponse>} Promise containing the status of the request.
   */
  updateAppointment(
    updatedAppointment: Appointment,
  ): Promise<ModifyAppointmentResponse> {
    return this.grpcConnection.modifyAppointment(updatedAppointment);
  }

  /**
   * Creates a medical exam for a given patient.
   * @param {MedicalExam} exam Medical exam details.
   * @returns {Promise<CreateMedicalExamResponse>} Promise containing the status of the request.
   */
  createMedicalExam(exam: MedicalExam): Promise<CreateMedicalExamResponse> {
    return this.grpcConnection.createMedicalExam(exam);
  }

  /**
   * Updates a medical exam for a given patient.
   * @param {MedicalExam} updatedExam Updated medical exam details.
   * @returns {Promise<ModifyMedicalExamResponse>} Promise containing the status of the request.
   */
  updateMedicalExam(
    updatedExam: MedicalExam,
  ): Promise<ModifyMedicalExamResponse> {
    return this.grpcConnection.modifyMedicalExam(updatedExam);
  }

  /**
   * Creates a medical event for a given patient.
   * @param {MedicalEvent} event Medical event details.
   * @returns {Promise<CreateMedicalEventResponse>} Promise containing the status of the request.
   */
  createMedicalEvent(event: MedicalEvent): Promise<CreateMedicalEventResponse> {
    return this.grpcConnection.createMedicalEvent(event);
  }

  /**
   * Updates a medical event for a given patient.
   * @param {MedicalEvent} updatedEvent Updated medical event details.
   * @returns {Promise<ModifyMedicalEventResponse>} Promise containing the status of the request.
   */
  updateMedicalEvent(
    updatedEvent: MedicalEvent,
  ): Promise<ModifyMedicalEventResponse> {
    return this.grpcConnection.modifyMedicalEvent(updatedEvent);
  }

  /**
   * Retrieves appointments for a specific doctor.
   * @param {GetAppointmentsFromDoctorRequest} request Request containing doctor identification.
   * @returns {Promise<GetAppointmentsFromDoctorResponse>} Promise with the list of appointments.
   */
  getAppointmentFromDoctor(
    request: GetAppointmentsFromDoctorRequest,
  ): Promise<GetAppointmentsFromDoctorResponse> {
    return this.grpcConnection.getAppointmentsFromDoctor(request);
  }

  /**
   * Modifies an existing appointment.
   * @param {Appointment} request Appointment details to update.
   * @returns {Promise<ModifyAppointmentResponse>} Promise with the update status.
   */
  modifyAppointment(request: Appointment): Promise<ModifyAppointmentResponse> {
    return this.grpcConnection.modifyAppointment(request);
  }

  /**
   * Modifies an existing medical event.
   * @param {MedicalEvent} request Medical event details to update.
   * @returns {Promise<ModifyMedicalEventResponse>} Promise with the update status.
   */
  modifyMedicalEvent(
    request: MedicalEvent,
  ): Promise<ModifyMedicalEventResponse> {
    return this.grpcConnection.modifyMedicalEvent(request);
  }

  /**
   * Modifies an existing medical exam.
   * @param {MedicalExam} request Medical exam details to update.
   * @returns {Promise<ModifyMedicalExamResponse>} Promise with the update status.
   */
  modifyMedicalExam(request: MedicalExam): Promise<ModifyMedicalExamResponse> {
    return this.grpcConnection.modifyMedicalExam(request);
  }

  /**
   * Modifies a patient's medical information.
   * @param {MedicalInfo} request Medical info to update.
   * @returns {Promise<ModifyMedicalInfoResponse>} Promise with the update status.
   */
  modifyMedicalInfo(request: MedicalInfo): Promise<ModifyMedicalInfoResponse> {
    return this.grpcConnection.modifyMedicalInfo(request);
  }

  getAllMedicalEvents(request: GetAllMedicalEventRequest) {
    return this.grpcConnection.getAllMedicalEvent(request);
  }

  getAllMedicalExams(request: GetAllMedicalExamRequest) {
    return this.grpcConnection.getAllMedicalExam(request);
  }
}
