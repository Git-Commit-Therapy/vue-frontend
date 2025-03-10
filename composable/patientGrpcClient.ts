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

/** Class representing all the services of a patient in a singleton pattern*/
export default class PatientGRPC {
  private static instance: PatientGRPC | null = null;
  private readonly grpcConnection: PatientServicesClient;

  /**
   * Private constructor to prevent direct construction calls with 'new'.
   * @param {string} url URL of the gRPC server.
   */
  private constructor(url: string) {
    this.grpcConnection = this.createPatientsGrpcClient(url);
  }

  /**
   * Gets the singleton instance of PatientGRPC.
   * @param {string} url URL of the gRPC server (only used when creating a new instance).
   * @returns {PatientGRPC} The singleton instance.
   */
  public static getInstance(url: string): PatientGRPC {
    if (!PatientGRPC.instance) {
      PatientGRPC.instance = new PatientGRPC(url);
    }
    return PatientGRPC.instance;
  }

  /**
   * This function creates a gRPC connection to a particular url.
   * @param {string} url URL of the gRPC server.
   * @returns {PatientServicesClient} Connection to the gRPC server.
   * @throws {Error} Throws an error if JWT is missing in the auth store.
   */
  private createPatientsGrpcClient(url: string): PatientServicesClient {
    const channel: Channel = createChannel(url);
    const authStore = useAuthStore();
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
   * @returns {Promise<Patient>} Promise that when fulfilled contains a patient object.
   */
  getPatient(): Promise<Patient> {
    return this.grpcConnection.getPatient({});
  }

  /**
   * Gets the patient's appointments.
   * @param {Date|undefined} fromDate Starting date.
   * @param {Date|undefined} toDate Ending date.
   * @returns {Promise<GetAppointmentsResponse>} Promise that when fulfilled contains the appointments matching the request.
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
   * Gets all patient's medical information.
   * @returns {Promise<GetMedicalInfoResponse>} Promise that when fulfilled contains all the patient's medical information.
   */
  getAllMedicalInfo(): Promise<GetMedicalInfoResponse> {
    return this.grpcConnection.getAllMedicalInfo({});
  }

  /**
   * Gets all patient's medical events.
   * @param {Date|undefined} fromDate Starting date.
   * @param {Date|undefined} toDate Ending date.
   * @returns {Promise<GetAllMedicalEventResponse>} Promise that when fulfilled contains all the patient's medical events.
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
   * @param {Date|undefined} toDate Ending date.
   * @returns {Promise<GetAllMedicalExamResponse>} Promise that when fulfilled contains all the patient's medical exams.
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
   * Gets details for a specific medical exam.
   * @param {MedicalExam} exam The medical exam to get details for.
   * @returns {Promise<GetMedicalExamDetailsResponse>} Promise that when fulfilled contains the medical exam details.
   */
  getMedicalExamDetails(
    exam: MedicalExam,
  ): Promise<GetMedicalExamDetailsResponse> {
    return this.grpcConnection.getMedicalExamDetails(MedicalExam.create(exam));
  }
}
