/**
 * @description       : Handles OTP generation, sending, and verification for applicant mobile number verification.
 *                      This class manages OTP records and communicates with the SMS utility for OTP delivery.
 * @last modified on  : 11-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 */
public without sharing class APFS_ApplicantMobileOtpHandler {

    /**
     * @description       : Sends an OTP to the specified phone number. If an OTP record for the phone number already exists,
     *                      it updates the OTP; otherwise, it creates a new OTP record. The OTP is sent via SMS using the 
     *                      APFS_Msg91UtilityController.
     * @param phoneNumber : The phone number to which the OTP is sent.
     * @throws APFS_CustomException : Custom exception thrown in case of errors in sending the OTP.
     */
    @AuraEnabled
    public static void sendOtp(String phoneNumber) {
        System.debug('APFS_ApplicantMobileOtpHandler.sendOtp - Start');
        try {
            // Validate phone number input
            validatePhoneNumber(phoneNumber);

            // Generate a new OTP
            String otp = generateOtp();
            System.debug('Generated OTP: ' + otp);

            // Create or update the OTP record
            upsertOtpRecord(phoneNumber, otp);
            
            // Send the OTP via SMS using the APFS_Msg91UtilityController
            Map<String, String> vars = new Map<String, String>{ 'var' => otp };
            APFS_Msg91UtilityController.sendSms(phoneNumber, 'Verify_Phone_Number', vars);

            System.debug('APFS_ApplicantMobileOtpHandler.sendOtp - OTP successfully processed for phone number: ' + phoneNumber);

        } catch (Exception e) {
            // Log the exception details using APFS_DebugLogUtility and throw a custom exception
            APFS_DebugLogUtility.logError('Class', 'APFS_ApplicantMobileOtpHandler', 'sendOtp', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Failed to send OTP.'+e.getMessage());
        } finally {
            System.debug('APFS_ApplicantMobileOtpHandler.sendOtp - End');
        }
    }

    /**
     * @description       : Verifies if the entered OTP matches the most recent OTP record for the given phone number.
     * @param phoneNumber : The phone number associated with the OTP.
     * @param enteredOtp  : The OTP entered by the user.
     * @return Boolean    : Returns true if the entered OTP matches the stored OTP, otherwise false.
     * @throws APFS_CustomException : Custom exception thrown if there is an error during OTP verification.
     */
    @AuraEnabled
    public static Boolean verifyOtp(String phoneNumber, String enteredOtp) {
        System.debug('APFS_ApplicantMobileOtpHandler.verifyOtp - Start');
        try {
            // Validate input parameters
            validatePhoneNumber(phoneNumber);
            if (String.isBlank(enteredOtp)) {
                throw new APFS_CustomException('Entered OTP cannot be blank.');
            }

            // Query the most recent OTP record for the given phone number
            Applicant_Mobile_Number_Verifier__c otpRecord = getOtpRecord(phoneNumber);
            if (otpRecord == null) {
                System.debug('No OTP record found for phone number: ' + phoneNumber);
                return false;
            }

            // Verify the entered OTP against the stored OTP
            Boolean isOtpValid = otpRecord.OTP__c == enteredOtp;
            System.debug('APFS_ApplicantMobileOtpHandler.verifyOtp - OTP verification result for phone number ' + phoneNumber + ': ' + isOtpValid);
            return isOtpValid;

        } catch (Exception e) {
            // Log the exception details using APFS_DebugLogUtility and throw a custom exception
            APFS_DebugLogUtility.logError('Class', 'APFS_ApplicantMobileOtpHandler', 'verifyOtp', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('OTP verification failed.'+e.getMessage());
        } finally {
            System.debug('APFS_ApplicantMobileOtpHandler.verifyOtp - End');
        }
    }

    /**
     * @description       : Generates a random 6-digit OTP for use in mobile number verification.
     * @return String     : Returns the generated OTP as a string.
     */
    private static String generateOtp() {
        Integer otpNumber = (Integer)(Math.floor(Math.random() * 900000) + 100000);
        return String.valueOf(otpNumber);
    }

    /**
     * @description       : Upserts the OTP record for the specified phone number.
     *                      Creates a new record if one does not already exist.
     * @param phoneNumber : The phone number associated with the OTP.
     * @param otp         : The OTP to be saved in the record.
     * @throws APFS_CustomException : Custom exception thrown if there is an error during the upsert process.
     */
    private static void upsertOtpRecord(String phoneNumber, String otp) {
        try {
            // Query to find an existing OTP record with the given phone number
            Applicant_Mobile_Number_Verifier__c record = getOtpRecord(phoneNumber);

            // If no existing record found, create a new one
            if (record == null) {
                record = new Applicant_Mobile_Number_Verifier__c();
                record.Phone__c = phoneNumber;
                System.debug('Creating new OTP record for phone number: ' + phoneNumber);
            } else {
                System.debug('Updating existing OTP record for phone number: ' + phoneNumber);
            }

            // Set the OTP value and upsert the record
            record.OTP__c = otp;
            upsert record;
        } catch (Exception e) {
            // Log the error and throw a custom exception
            APFS_DebugLogUtility.logError('Class', 'APFS_ApplicantMobileOtpHandler', 'upsertOtpRecord', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error upserting OTP record: ' + e.getMessage());
        }
    }

    /**
     * @description       : Retrieves the OTP record for the specified phone number.
     * @param phoneNumber : The phone number associated with the OTP.
     * @return Applicant_Mobile_Number_Verifier__c : The OTP record if found, otherwise null.
     */
    private static Applicant_Mobile_Number_Verifier__c getOtpRecord(String phoneNumber) {
        List<Applicant_Mobile_Number_Verifier__c> records = [
            SELECT Id, OTP__c 
            FROM Applicant_Mobile_Number_Verifier__c 
            WHERE Phone__c = :phoneNumber 
            LIMIT 1
        ];
        return records.isEmpty() ? null : records[0];
    }

    /**
     * @description       : Validates that the phone number is not blank.
     * @param phoneNumber : The phone number to validate.
     * @throws APFS_CustomException : Custom exception thrown if the phone number is blank.
     */
    private static void validatePhoneNumber(String phoneNumber) {
        if (String.isBlank(phoneNumber)) {
            throw new APFS_CustomException('Phone number cannot be blank.');
        }
    }
}