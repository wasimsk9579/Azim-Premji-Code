/**
 * @description       : Utility class to log exceptions and errors into the custom Debug Log object along with user details and context information.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 29-09-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class         : APFS_DebugLogUtilityTest
**/
public class APFS_DebugLogUtility {

    /**
     * @description       : Logs an error into the custom Debug Log object with user details, class/trigger details, and context.
     * @param apexType    : Type of the Apex source (Class, Trigger, Batch Class, etc.).
     * @param apexName    : The name of the class or trigger where the error occurred.
     * @param methodName  : The name of the method where the error occurred.
     * @param errorMessage: The error message to log.
     * @param userId      : The ID of the user associated with the error.
     */
    public static void logError(String apexType, String apexName, String methodName, String errorMessage, Id userId) {
        try {
            // Create a new Debug Log record
            Debug_Log__c logEntry = new Debug_Log__c(
                Apex_Type__c = apexType, 
                Apex_Type_Name__c = apexName, 
                Apex_Type_Method_Name__c = methodName,
                Error_Message__c = errorMessage,
                CreatedDateTime__c = System.now(),
                OwnerId = userId
            );

            // Insert the log record
            insert logEntry;
            System.debug('Error logged in Debug Log object.');

        } catch (Exception e) {
            System.debug('Failed to log error: ' + e.getMessage());
        }
    }
}