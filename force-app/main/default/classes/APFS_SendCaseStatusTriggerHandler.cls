/**
 * @description       : Handles case updates, specifically monitoring status changes to send SMS notifications
 *                      using the Case's Contact Mobile field and MSG91 platform.
 * @last modified on  : 11-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class         : APFS_SendCaseStatusTriggerHandlerTest
 **/
public without sharing class APFS_SendCaseStatusTriggerHandler {

    /**
     * @description       : Handles logic after cases are updated, specifically monitoring status changes.
     *                      Adds cases to a list if the status has changed and sends SMS notifications.
     * @param newCases    : The list of updated Case records.
     * @param oldCaseMap  : A map of the old Case records, keyed by Id.
     **/
    public static void onAfterUpdate(List<Case> newCases, Map<Id, Case> oldCaseMap) {
        System.debug('APFS_SendCaseStatusTriggerHandler.onAfterUpdate - Start');
        try {
            List<Case> casesToProcess = new List<Case>();

            // Identify cases where the status has changed
            for (Case c : newCases) {
                Case oldCase = oldCaseMap.get(c.Id);

                // Add cases to the list where the status has changed from the previous value
                if (oldCase != null && c.Status != oldCase.Status && c.Status != 'New' && c.Status != 'In Progress') {
                    casesToProcess.add(c);
                }
            }

            // Process SMS notifications if there are cases with status changes
            if (!casesToProcess.isEmpty()) {
                sendStatusChangeSMS(casesToProcess);
            }
        } catch (Exception e) {
            // Log any exceptions using the DebugLogUtility
            APFS_DebugLogUtility.logError('Class', 'APFS_SendCaseStatusTriggerHandler', 'onAfterUpdate', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error in processing case updates: ' + e.getMessage());
        } finally {
            System.debug('APFS_SendCaseStatusTriggerHandler.onAfterUpdate - End');
        }
    }

    /**
     * @description       : Handles logic after cases are inserted, monitoring if contact information is present
     *                      to send SMS notifications.
     * @param newCases    : The list of newly inserted Case records.
     **/
    public static void onAfterInsert(List<Case> newCases) {
        System.debug('APFS_SendCaseStatusTriggerHandler.onAfterInsert - Start');
        try {
            List<Case> casesToProcess = new List<Case>();

            // Filter cases with contact information for SMS notifications
            for (Case c : newCases) {
                if (c.ContactId != null && c.ContactMobile != null) {
                    casesToProcess.add(c);
                }
            }

            // Send SMS notifications for cases meeting the criteria
            if (!casesToProcess.isEmpty()) {
                sendCreationSms(casesToProcess);
            }
        } catch (Exception e) {
            // Log any exceptions using the DebugLogUtility
            APFS_DebugLogUtility.logError('Class', 'APFS_SendCaseStatusTriggerHandler', 'onAfterInsert', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error in processing case insertions: ' + e.getMessage());
        } finally {
            System.debug('APFS_SendCaseStatusTriggerHandler.onAfterInsert - End');
        }
    }

    /**
     * @description       : Sends SMS notifications for cases where the status has changed.
     *                      Retrieves contact details and sends the notification using MSG91.
     * @param casesToProcess : The list of cases with status changes.
     **/
    private static void sendStatusChangeSMS(List<Case> casesToProcess) {
        System.debug('APFS_SendCaseStatusTriggerHandler.sendStatusChangeSMS - Start');
        try {
            // Query for Case and Contact details
            List<Case> casesWithDetails = [
                SELECT Id, ContactId, Contact.FirstName, ContactMobile, CaseNumber 
                FROM Case 
                WHERE Id IN :casesToProcess
            ];

            List<String> smsSentCases = new List<String>();

            // Send SMS for each case
            for (Case c : casesWithDetails) {
                if (c.ContactId != null && c.Contact.FirstName != null && c.ContactMobile != null) {
                    Map<String, String> vars = new Map<String, String>{
                        'var' => 'Hello',
                        'var1' => c.Contact.FirstName,
                        'var2' => c.CaseNumber
                    };

                    // Call the MSG91 utility class to send the SMS
                    APFS_Msg91UtilityController.sendSms(c.ContactMobile, 'Ticket_Status_Change', vars);
                    smsSentCases.add(c.CaseNumber);
                }
            }

            System.debug('SMS notifications sent for Case Numbers: ' + smsSentCases);

        } catch (Exception e) {
            // Log any exceptions using the DebugLogUtility
            APFS_DebugLogUtility.logError('Class', 'APFS_SendCaseStatusTriggerHandler', 'sendStatusChangeSMS', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error in sending status change SMS: ' + e.getMessage());
        } finally {
            System.debug('APFS_SendCaseStatusTriggerHandler.sendStatusChangeSMS - End');
        }
    }

    /**
     * @description       : Sends SMS notifications for newly created cases with valid contact information.
     * @param casesToProcess : The list of cases to send SMS notifications for.
     **/
    private static void sendCreationSms(List<Case> casesToProcess) {
        System.debug('APFS_SendCaseStatusTriggerHandler.sendCreationSms - Start');
        try {
            // Query for Case and Contact details
            List<Case> casesWithDetails = [
                SELECT Id, ContactId, Contact.FirstName, ContactMobile, CaseNumber 
                FROM Case 
                WHERE Id IN :casesToProcess
            ];

            List<String> smsSentCases = new List<String>();

            // Send SMS for each case
            for (Case c : casesWithDetails) {
                if (c.ContactId != null && c.Contact.FirstName != null && c.ContactMobile != null) {
                    Map<String, String> vars = new Map<String, String>{
                        'var' => 'Hello',
                        'var1' => c.Contact.FirstName,
                        'var2' => c.CaseNumber
                    };

                    // Call the MSG91 utility class to send the SMS
                    APFS_Msg91UtilityController.sendSms(c.ContactMobile, 'Rasie_Query', vars);
                    smsSentCases.add(c.CaseNumber);
                }
            }

            System.debug('SMS notifications sent for Case Numbers: ' + smsSentCases);

        } catch (Exception e) {
            // Log any exceptions using the DebugLogUtility
            APFS_DebugLogUtility.logError('Class', 'APFS_SendCaseStatusTriggerHandler', 'sendCreationSms', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error in sending creation SMS: ' + e.getMessage());
        } finally {
            System.debug('APFS_SendCaseStatusTriggerHandler.sendCreationSms - End');
        }
    }
}