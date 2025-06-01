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
  GetAllMedicalEventResponse,
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
import {
  EmergencyWardServicesDefinition,
  type EmergencyWardServicesClient,
  AddPatientRequest,
  AddPatientResponse,
  TransferPatientRequest,
  RemovePatientRequest,
  CallPatientRequest,
  type EmergencyWardPanelsServiceClient,
  EmergencyWardPanelsServiceDefinition,
  QueueStatusResponse,
} from "~/composable/protobuf/frontend/emergency_ward_services";
import type {
  Doctor,
  Patient,
  Staff,
} from "~/composable/protobuf/frontend/user";
import type { MedicalInfo } from "../protobuf/frontend/medical_info";
import type { Appointment } from "../protobuf/frontend/appointment";
import type { MedicalExam } from "../protobuf/frontend/medical_exam";
import type { MedicalEvent } from "../protobuf/frontend/medical_event";
import type {
  GetAllMedicalExamRequest,
  GetAllMedicalExamResponse,
} from "../protobuf/frontend/patient_services";
import type { Empty } from "../protobuf/frontend/google/protobuf/empty";

/** Class representing employee-related gRPC services using a singleton pattern. */
export default class EmployeeGRPC {
  private static instance: EmployeeGRPC | null = null;
  private readonly employeeConnection: EmployeeServicesClient;
  private readonly emergencyWardConnection: EmergencyWardServicesClient;
  private readonly emergencyWardPanelConnection: EmergencyWardPanelsServiceClient;

  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.employeeConnection = this.createEmployeesGrpcClient(url);
    this.emergencyWardConnection = this.createEmergencyWardGrpcClient(url);
    this.emergencyWardPanelConnection =
      this.createEmergencyWardPanelGrpcClient(url);
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
   * Creates a gRPC connection to the emergency ward services.
   * @param {string} url URL of the gRPC server.
   * @returns {EmergencyWardServicesClient} Connection to the emergency ward gRPC services.
   * @throws {Error} If the JWT is missing or invalid.
   */
  private createEmergencyWardGrpcClient(
    url: string,
  ): EmergencyWardServicesClient {
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
      .create(EmergencyWardServicesDefinition, channel);
  }

  /**
   * Creates a gRPC connection to the emergency ward services.
   * @param {string} url URL of the gRPC server.
   * @returns {EmergencyWardServicesClient} Connection to the emergency ward gRPC services.
   * @throws {Error} If the JWT is missing or invalid.
   */
  private createEmergencyWardPanelGrpcClient(
    url: string,
  ): EmergencyWardPanelsServiceClient {
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
      .create(EmergencyWardPanelsServiceDefinition, channel);
  }

  /**
   * Retrieves the doctor associated to the JWT.
   * @returns {Promise<Doctor>} Promise resolving to a doctor.
   */
  getDoctor(): Promise<Doctor> {
    return this.employeeConnection.getDoctor({});
  }

  /**
   * Retrieves all doctors.
   * @returns {Promise<GetAllDoctorsResponse>} Promise resolving to the list of doctors.
   */
  getAllDoctors(): Promise<GetAllDoctorsResponse> {
    return this.employeeConnection.getAllDoctors({});
  }

  /**
   * Retrieves all patients.
   * @returns {Promise<GetAllPatientsResponse>} Promise resolving to the list of patients.
   */
  getAllPatients(): Promise<GetAllPatientsResponse> {
    return this.employeeConnection.getAllPatients({});
  }

  /**
   * Retrieves all wards.
   * @returns {Promise<GetAllWardResponse>} Promise resolving to the list of wards.
   */
  getAllWards(): Promise<GetAllWardResponse> {
    return this.employeeConnection.getAllWard({});
  }

  /**
   * Retrieves all staff members.
   * @returns {Promise<GetAllStaffsResponse>} Promise resolving to the list of staff.
   */
  getAllStaff(): Promise<GetAllStaffsResponse> {
    return this.employeeConnection.getAllStaffs({});
  }

  /**
   * Creates a new doctor record.
   * @param {Doctor} doctor Doctor object to create.
   * @returns {Promise<CreateDoctorResponse>} Server response.
   */
  createDoctor(doctor: Doctor): Promise<CreateDoctorResponse> {
    return this.employeeConnection.createDoctor(doctor);
  }

  /**
   * Edits an existing doctor record.
   * @param {Doctor} newDoctorDetails Updated doctor information.
   * @returns {Promise<ModifyDoctorResponse>} Server response.
   */
  editDoctor(newDoctorDetails: Doctor): Promise<ModifyDoctorResponse> {
    return this.employeeConnection.modifyDoctor(newDoctorDetails);
  }

  /**
   * Creates a new patient record.
   * @param {Patient} patient Patient object to create.
   * @returns {Promise<CreatePatientResponse>} Server response.
   */
  createPatient(patient: Patient): Promise<CreatePatientResponse> {
    return this.employeeConnection.createPatient(patient);
  }

  /**
   * Edits an existing patient record.
   * @param {Patient} newPatientDetails Updated patient information.
   * @returns {Promise<ModifyPatientResponse>} Server response.
   */
  editPatient(newPatientDetails: Patient): Promise<ModifyPatientResponse> {
    return this.employeeConnection.modifyPatient(newPatientDetails);
  }

  /**
   * Creates a new staff record.
   * @param {Staff} staff Staff object to create.
   * @returns {Promise<CreateStaffResponse>} Server response.
   */
  createStaff(staff: Staff): Promise<CreateStaffResponse> {
    return this.employeeConnection.createStaff(staff);
  }

  /**
   * Edits an existing staff record.
   * @param {Staff} newStaffDetails Updated staff information.
   * @returns {Promise<ModifyStaffResponse>} Server response.
   */
  editStaff(newStaffDetails: Staff): Promise<ModifyStaffResponse> {
    return this.employeeConnection.modifyStaff(newStaffDetails);
  }

  /**
   * Updates medical information for a given patient.
   * @param {MedicalInfo} updatedMedicalInfo Medical information for the patient.
   * @returns {Promise<ModifyMedicalInfoResponse>} Promise containing the status of the request.
   */
  updateMedicalInfo(
    updatedMedicalInfo: MedicalInfo,
  ): Promise<ModifyMedicalInfoResponse> {
    return this.employeeConnection.modifyMedicalInfo(updatedMedicalInfo);
  }

  /**
   * Creates medical information for a given patient.
   * @param {MedicalInfo} info Medical information for the patient.
   * @returns {Promise<CreateMedicalInfoResponse>} Promise containing the status of the request.
   */
  createMedicalInfo(info: MedicalInfo): Promise<CreateMedicalInfoResponse> {
    return this.employeeConnection.createMedicalInfo(info);
  }

  /**
   * Creates an appointment for a given patient.
   * @param {Appointment} appointment Appointment details including staff, doctor, and patient.
   * @returns {Promise<CreateAppointmentResponse>} Promise containing the status of the request.
   */
  createAppointment(
    appointment: Appointment,
  ): Promise<CreateAppointmentResponse> {
    return this.employeeConnection.createAppointment(appointment);
  }

  /**
   * Updates an existing appointment.
   * @param {Appointment} updatedAppointment Updated appointment details.
   * @returns {Promise<ModifyAppointmentResponse>} Promise containing the status of the request.
   */
  updateAppointment(
    updatedAppointment: Appointment,
  ): Promise<ModifyAppointmentResponse> {
    return this.employeeConnection.modifyAppointment(updatedAppointment);
  }

  /**
   * Creates a medical exam for a given patient.
   * @param {MedicalExam} exam Medical exam details.
   * @returns {Promise<CreateMedicalExamResponse>} Promise containing the status of the request.
   */
  createMedicalExam(exam: MedicalExam): Promise<CreateMedicalExamResponse> {
    return this.employeeConnection.createMedicalExam(exam);
  }

  /**
   * Updates a medical exam for a given patient.
   * @param {MedicalExam} updatedExam Updated medical exam details.
   * @returns {Promise<ModifyMedicalExamResponse>} Promise containing the status of the request.
   */
  updateMedicalExam(
    updatedExam: MedicalExam,
  ): Promise<ModifyMedicalExamResponse> {
    return this.employeeConnection.modifyMedicalExam(updatedExam);
  }

  /**
   * Creates a medical event for a given patient.
   * @param {MedicalEvent} event Medical event details.
   * @returns {Promise<CreateMedicalEventResponse>} Promise containing the status of the request.
   */
  createMedicalEvent(event: MedicalEvent): Promise<CreateMedicalEventResponse> {
    return this.employeeConnection.createMedicalEvent(event);
  }

  /**
   * Updates a medical event for a given patient.
   * @param {MedicalEvent} updatedEvent Updated medical event details.
   * @returns {Promise<ModifyMedicalEventResponse>} Promise containing the status of the request.
   */
  updateMedicalEvent(
    updatedEvent: MedicalEvent,
  ): Promise<ModifyMedicalEventResponse> {
    return this.employeeConnection.modifyMedicalEvent(updatedEvent);
  }

  /**
   * Retrieves appointments for a specific doctor.
   * @param {GetAppointmentsFromDoctorRequest} request Request containing doctor identification.
   * @returns {Promise<GetAppointmentsFromDoctorResponse>} Promise with the list of appointments.
   */
  getAppointmentFromDoctor(
    request: GetAppointmentsFromDoctorRequest,
  ): Promise<GetAppointmentsFromDoctorResponse> {
    return this.employeeConnection.getAppointmentsFromDoctor(request);
  }

  /**
   * Modifies an existing appointment.
   * @param {Appointment} request Appointment details to update.
   * @returns {Promise<ModifyAppointmentResponse>} Promise with the update status.
   */
  modifyAppointment(request: Appointment): Promise<ModifyAppointmentResponse> {
    return this.employeeConnection.modifyAppointment(request);
  }

  /**
   * Modifies an existing medical event.
   * @param {MedicalEvent} request Medical event details to update.
   * @returns {Promise<ModifyMedicalEventResponse>} Promise with the update status.
   */
  modifyMedicalEvent(
    request: MedicalEvent,
  ): Promise<ModifyMedicalEventResponse> {
    return this.employeeConnection.modifyMedicalEvent(request);
  }

  /**
   * Modifies an existing medical exam.
   * @param {MedicalExam} request Medical exam details to update.
   * @returns {Promise<ModifyMedicalExamResponse>} Promise with the update status.
   */
  modifyMedicalExam(request: MedicalExam): Promise<ModifyMedicalExamResponse> {
    return this.employeeConnection.modifyMedicalExam(request);
  }

  /**
   * Modifies a patient's medical information.
   * @param {MedicalInfo} request Medical info to update.
   * @returns {Promise<ModifyMedicalInfoResponse>} Promise with the update status.
   */
  modifyMedicalInfo(request: MedicalInfo): Promise<ModifyMedicalInfoResponse> {
    return this.employeeConnection.modifyMedicalInfo(request);
  }

  /**
   * Retrieves all medical events based on the provided request.
   * @param {GetAllMedicalEventRequest} request Request parameters for fetching medical events.
   * @returns {Promise<GetAllMedicalEventResponse>} Promise containing the medical events response.
   */
  getAllMedicalEvents(
    request: GetAllMedicalEventRequest,
  ): Promise<GetAllMedicalEventResponse> {
    return this.employeeConnection.getAllMedicalEvent(request);
  }

  /**
   * Retrieves all medical exams based on the provided request.
   * @param {GetAllMedicalExamRequest} request Request parameters for fetching medical exams.
   * @returns {Promise<GetAllMedicalExamResponse>} Promise containing the medical exams response.
   */
  getAllMedicalExams(
    request: GetAllMedicalExamRequest,
  ): Promise<GetAllMedicalExamResponse> {
    return this.employeeConnection.getAllMedicalExam(request);
  }

  /**
   * Adds a patient to the emergency ward with severity assessment.
   * @param {AddPatientRequest} request Patient details including severity code and medical report.
   * @returns {Promise<AddPatientResponse>} Promise containing patient ID and emergency ward code.
   */
  addEmergencyPatient(request: AddPatientRequest): Promise<AddPatientResponse> {
    return this.emergencyWardConnection.addPatient(request);
  }

  /**
   * Transfers a patient from emergency ward to a specific ward.
   * @param {TransferPatientRequest} request Patient and target ward information.
   * @returns {Promise<Empty>} Promise indicating transfer completion.
   */
  transferEmergencyPatient(request: TransferPatientRequest): Promise<Empty> {
    return this.emergencyWardConnection.transferPatient(request);
  }

  /**
   * Removes a patient from the emergency ward with discharge documentation.
   * @param {RemovePatientRequest} request Patient details and discharge letter.
   * @returns {Promise<Empty>} Promise indicating removal completion.
   */
  removeEmergencyPatient(request: RemovePatientRequest): Promise<Empty> {
    return this.emergencyWardConnection.removePatient(request);
  }

  /**
   * Calls a patient for their visit in the emergency ward.
   * @param {CallPatientRequest} request Patient and ambulatory information.
   * @returns {Promise<Empty>} Promise indicating the patient has been called.
   */
  callEmergencyPatientForVisit(request: CallPatientRequest): Promise<Empty> {
    return this.emergencyWardConnection.callPatientForVisit(request);
  }

  /**
   * Returns the list of all the patients in a emergency visit.
   * @returns {Promise<QueueStatusResponse>} Promise indicating the queue status.
   */
  getEmergencyPatients(): Promise<QueueStatusResponse> {
    return this.emergencyWardPanelConnection.retrieveInVisitingStatus({});
  }
}
