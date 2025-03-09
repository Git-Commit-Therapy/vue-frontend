import {
  createChannel,
  createClientFactory,
  Metadata,
  type Channel,
} from "nice-grpc-web";
import {
  PatientServicesDefinition,
  GetAppointmentsRequest,
  GetAllMedicalEventRequest,
  GetAllMedicalExamRequest,
  type PatientServicesClient,
  GetAllMedicalExamResponse,
  GetMedicalInfoResponse,
  GetAppointmentsResponse,
  GetAllMedicalEventResponse,
  GetMedicalExamDetailsResponse,
} from "@/composable/protobuf/frontend/patient_services";
import { Patient } from "@/composable/protobuf/frontend/user";
import { MedicalExam } from "@/composable/protobuf/frontend/medical_exam";
import { useAuthStore } from "@/stores/authStore";

/** Class representing all the services of a patient */
export default class PatientGRPC {
  private readonly grpcConnection: PatientServicesClient;
  /**
    Creates a connection to the gRPC server.
    @param {string} url URL of the gRPC server.
  */
  constructor(url: string) {
    this.grpcConnection = this.createPatientsGrpcClient(url);
  }

  /**
    This function creates a gRPC connection to a particular url.
    @param {string} url URL of the gRPC server.
    @returns {PatientServicesClient} Connection to the gRPC server.
  */
  private createPatientsGrpcClient(url: string): PatientServicesClient {
    const channel: Channel = createChannel(url);
    const authStore = useAuthStore();
    // TODO: assert that JWT is stored in the auth store.
    const token = authStore.jwt;
    if (!token) {
      throw new Error("JWT is missing");
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
      .create(PatientServicesDefinition, channel);
  }

  /**
   * Gets the patient's information.
   * @returns {Promise<Patient>} Promise that when fullfilled contains a patient object.
   */
  getPatient(): Promise<Patient> {
    return this.grpcConnection.getPatient({});
  }

  /**
   * Gets the patient's appointments.
   * @param {Date|undefined} fromDate Starting date.
   * @param {Date|undefined} toDate Arriving date.
   * @returns {Promise<GetAppointmentsResponse>} Promise that when fullfilled contains the appointments matching the request.
   */
  getAppointments(
    fromDate: Date | undefined,
    toDate: Date | undefined,
  ): Promise<GetAppointmentsResponse> {
    return this.grpcConnection.getAppointments(
      GetAppointmentsRequest.create({ fromDate, toDate }),
    );
  }
  /**
   * Gets all patient's medical informations.
   * @returns {Promise<GetMedicalInfoResponse>} Promise that when fullfilled contains all the patient's medical informations.
   */
  getAllMedicalInfo(): Promise<GetMedicalInfoResponse> {
    return this.grpcConnection.getAllMedicalInfo({});
  }

  /**
   * Gets all patient's medical events.
   * @param {Date|undefined} fromDate Starting date.
   * @param {Date|undefined} toDate Arriving date.
   * @returns {Promise<GetAllMedicalEventResponse>} Promise that when fullfilled contains all the patient's medical events.
   */
  getAllMedicalEvent(
    fromDate: Date | undefined,
    toDate: Date | undefined,
  ): Promise<GetAllMedicalEventResponse> {
    return this.grpcConnection.getAllMedicalEvent(
      GetAllMedicalEventRequest.create({ fromDate, toDate }),
    );
  }

  /**
   * Gets all patient's medical exams.
   * @param {Date|undefined} fromDate Starting date.
   * @param {Date|undefined} toDate Arriving date.
   * @returns {Promise<GetAllMedicalEventResponse>} Promise that when fullfilled contains all the patient's medical exams.
   */
  getAllMedicalExam(
    fromDate: Date | undefined,
    toDate: Date | undefined,
  ): Promise<GetAllMedicalExamResponse> {
    return this.grpcConnection.getAllMedicalExam(
      GetAllMedicalExamRequest.create({ fromDate, toDate }),
    );
  }

  /**
   * Gets all patient's medical exams.
   * @returns {Promise<GetMedicalExamDetailsResponse>} Promise that when fullfilled contains all the patient's medical exams information.
   */
  getMedicalExamDetails(
    exam: MedicalExam,
  ): Promise<GetMedicalExamDetailsResponse> {
    return this.grpcConnection.getMedicalExamDetails(MedicalExam.create(exam));
  }
}
