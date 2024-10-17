/**
 * @description       : Trigger handler to process Application status changes, send SMS notifications, and handle Offer creation.
 *                      Supports both single and bulk status changes.
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 15-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 */
public without sharing class APFS_SendApplicationStatusTriggerHandler {

    // Constants for maximum SMS messages per queueable job
    private static final Integer MAX_SMS_CALLS = 40;
    
    // List to accumulate SMS messages before queuing a bulk SMS job
    private static List<APFS_SMSHelper.SMSMessage> smsMessages = new List<APFS_SMSHelper.SMSMessage>();

    /**
     * @description : Processes Application status updates, sending SMS notifications and handling Offer creation.
     *                Handles single or bulk status changes.
     * @param newApplications : List of updated Application__c records (after update).
     * @param oldApplicationMap : Map of Application__c records before update.
     */
    public static void onAfterUpdate(List<Application__c> newApplications, Map<Id, Application__c> oldApplicationMap) {
        System.debug('APFS_SendApplicationStatusTriggerHandler.onAfterUpdate - Processing started.');

        try {
            List<Application__c> applicationsToProcess = new List<Application__c>();
            List<Application__c> submittedApplications = new List<Application__c>();
            List<Application__c> offerApprovedApplications = new List<Application__c>();

            for (Application__c app : newApplications) {
                Application__c oldApp = oldApplicationMap.get(app.Id);
                 // Check if the application external status has changed
    			if (app.Application_External_Status__c != oldApp.Application_External_Status__c) {
        
        		// Handle "Submitted" status separately
        		if (app.Application_External_Status__c == 'Submitted') {
            		submittedApplications.add(app);
            		System.debug('Application submitted: ' + app.Id);
        	}
        		// Handle all other status changes
        	else {
            		applicationsToProcess.add(app);
            	System.debug('Status change for application: ' + app.Id + ', New Status: ' + app.Application_External_Status__c);
        	}
    	}

                 // Check if the application internal status has changed
                if (app.Application_Internal_Status__c != oldApp.Application_Internal_Status__c){
                    // Handle "Offer Letter Approved" status separately
                    if (app.Application_Internal_Status__c == 'Offer Letter Approved'){
                         offerApprovedApplications.add(app);
                    	 System.debug('Offer Letter Approved for application: ' + app.Id);
                    }
                }
                
       }

            // Process SMS for submitted applications
            if (!submittedApplications.isEmpty()) {
                processSubmittedStatusSMS(submittedApplications);
            }

            // Process SMS for other status changes
            if (!applicationsToProcess.isEmpty()) {
                processStatusChangeSMS(applicationsToProcess);
            }
            
            // Create Offer records for offer letter approved applications
            if (!offerApprovedApplications.isEmpty()) {
                createOfferRecords(offerApprovedApplications);
            }

            // Enqueue the bulk SMS job if there are accumulated SMS messages
            enqueueBulkSmsJobs();
            
        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'onAfterUpdate', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error processing application status update: ' + e.getMessage());
        }

        System.debug('APFS_SendApplicationStatusTriggerHandler.onAfterUpdate - Processing complete.');
    }

    /**
     * @description : Sends SMS for applications with "Submitted" status.
     * @param submittedApplications : List of applications that have been submitted.
     */
    private static void processSubmittedStatusSMS(List<Application__c> submittedApplications) {
        System.debug('Processing submitted applications for SMS sending: ' + submittedApplications.size());

        try {
            // Query Contact details for SMS sending
            submittedApplications = [
                SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.MobilePhone, Name
                FROM Application__c
                WHERE Id IN :submittedApplications
            ];

            for (Application__c app : submittedApplications) {
                if (isValidContact(app)) {
                    Map<String, String> vars = new Map<String, String>{
                        'var' => 'Hello',
                        'var1' => app.Contact__r.FirstName,
                        'var2' => app.Name 
                    };

                    smsMessages.add(new APFS_SMSHelper.SMSMessage(app.Contact__r.MobilePhone, 'Application_Submitted', vars));
                    System.debug('Added SMS for submitted application: ' + app.Id);

                    // Enqueue SMS job if the message limit is reached
                    if (smsMessages.size() >= MAX_SMS_CALLS) {
                        enqueueBulkSmsJobs();
                    }
                } else {
                    System.debug('Invalid contact data for application: ' + app.Id);
                }
            }
        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'processSubmittedStatusSMS', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error processing submitted applications SMS: ' + e.getMessage());
        }
    }

    /**
     * @description : Sends SMS for applications with status changes other than "Submitted".
     * @param applicationsToProcess : List of applications with other status changes.
     */
    private static void processStatusChangeSMS(List<Application__c> applicationsToProcess) {
        System.debug('Processing applications with status changes for SMS sending: ' + applicationsToProcess.size());

        try {
            // Query Contact details for SMS sending
            applicationsToProcess = [
                SELECT Id, Contact__c, Contact__r.FirstName, Contact__r.MobilePhone, Name, Application_External_Status__c
                FROM Application__c
                WHERE Id IN :applicationsToProcess
            ];

            for (Application__c app : applicationsToProcess) {
                if (isValidContact(app)) {
                    Map<String, String> vars = new Map<String, String>{
                        'var' => 'Hello',
                        'var1' => app.Contact__r.FirstName,
                        'var2' => app.Name
                    };

                    smsMessages.add(new APFS_SMSHelper.SMSMessage(app.Contact__r.MobilePhone, 'Change_Application_Status', vars));
                    System.debug('Added SMS for status change of application: ' + app.Id);

                    // Enqueue SMS job if the message limit is reached
                    if (smsMessages.size() >= MAX_SMS_CALLS) {
                        enqueueBulkSmsJobs();
                    }
                } else {
                    System.debug('Invalid contact data for application: ' + app.Id);
                }
            }
        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'processStatusChangeSMS', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error processing status change SMS: ' + e.getMessage());
        }
    }

    /**
     * @description : Validates if the contact data for an application is complete and valid.
     * @param app : The application record being processed.
     * @return : Boolean indicating if the contact data is valid.
     */
    private static Boolean isValidContact(Application__c app) {
        System.debug('Validating contact data for application: ' + app.Id);
        return app.Contact__c != null && app.Contact__r != null && 
               app.Contact__r.FirstName != null && app.Contact__r.MobilePhone != null;
    }

    /**
     * @description : Enqueues a bulk SMS job if there are SMS messages accumulated.
     */
    private static void enqueueBulkSmsJobs() {
        if (!smsMessages.isEmpty()) {
            System.debug('Enqueuing bulk SMS job for ' + smsMessages.size() + ' messages');
            try {
                APFS_Msg91UtilityController.sendBulkSms(new List<APFS_SMSHelper.SMSMessage>(smsMessages));
                smsMessages.clear(); // Clear after enqueuing
                System.debug('Cleared SMS messages after enqueuing job.');
            } catch (Exception e) {
                APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'enqueueBulkSmsJobs', e.getMessage(), UserInfo.getUserId());
                throw new APFS_CustomException('Error enqueuing bulk SMS job: ' + e.getMessage());
            }
        }
    }

    /**
     * @description : Creates Offer records for applications with "Offer Letter Approved" status.
     * @param offerApprovedApplications : List of applications where Offer letters are approved.
     */
    private static void createOfferRecords(List<Application__c> offerApprovedApplications) {
        System.debug('Creating offer records for applications: ' + offerApprovedApplications.size());

        if (offerApprovedApplications.isEmpty()) {
            System.debug('No applications to process for Offer creation.');
            return;
        }

        List<Offer__c> offersToCreate = new List<Offer__c>();
        Set<Id> applicationIds = new Set<Id>();

        for (Application__c app : offerApprovedApplications) {
            applicationIds.add(app.Id);
        }

        try {
            // Fetch scholarship and admission details
            Map<Id, Application__c> scholarshipEditionMap = new Map<Id, Application__c>(
                [SELECT Id, Scholarship_Round__r.Scholarship_Edition__r.Offer_Start_Month__c, 
                        Scholarship_Round__r.Scholarship_Edition__r.Year__c
                 FROM Application__c WHERE Id IN :applicationIds]
            );

            Map<Id, Application__c> applicationsMap = new Map<Id, Application__c>(
                [SELECT Id, Name, (SELECT Id, Course_Duration_In_Years__c, 
                        Course_Year_Of_Studying__c, Application__c 
                 FROM Admissions__r WHERE Is_Active__c = true ORDER BY CreatedDate DESC LIMIT 1) 
                 FROM Application__c WHERE Id IN :applicationIds]
            );

            Map<Id, Admission__c> admissionsMapByAppId = new Map<Id, Admission__c>();

            for (Application__c app : applicationsMap.values()) {
                if (!app.Admissions__r.isEmpty()) {
                    admissionsMapByAppId.put(app.Id, app.Admissions__r[0]);
                }
            }

            for (Application__c app : offerApprovedApplications) {
                Offer__c newOffer = new Offer__c();
                newOffer.Application__c = app.Id;
                newOffer.Current_Offer__c = true;

                Application__c scholarshipApp = scholarshipEditionMap.get(app.Id);
                if (scholarshipApp != null) {
                    String monthName = scholarshipApp.Scholarship_Round__r.Scholarship_Edition__r.Offer_Start_Month__c;
                    String yearString = scholarshipApp.Scholarship_Round__r.Scholarship_Edition__r.Year__c;
                    newOffer.Offer_Start_Date__c = calculateOfferStartDate(monthName, yearString);
                }

                Admission__c admission = admissionsMapByAppId.get(app.Id);
                if (admission != null) {
                    Decimal courseDuration = Decimal.valueOf(admission.Course_Duration_In_Years__c);
                    Decimal courseYear = Decimal.valueOf(admission.Course_Year_Of_Studying__c);
                    newOffer.Net_Course_Duration__c = (courseDuration - courseYear) + 1;

                    if (newOffer.Offer_Start_Date__c != null) {
                        newOffer.Offer_End_Date__c = calculateOfferEndDate(newOffer.Offer_Start_Date__c, newOffer.Net_Course_Duration__c);
                    }
                }

                offersToCreate.add(newOffer);
            }

            if (!offersToCreate.isEmpty()) {
                Database.SaveResult[] results = Database.insert(offersToCreate, false);

                for (Database.SaveResult result : results) {
                    if (result.isSuccess()) {
                        System.debug('Successfully inserted Offer: ' + result.getId());
                    } else {
                        APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'createOfferRecords', result.getErrors()[0].getMessage(), UserInfo.getUserId());
                    }
                }
            }

        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_SendApplicationStatusTriggerHandler', 'createOfferRecords', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error creating Offer records: ' + e.getMessage());
        }
    }

    /**
     * @description : Calculate the offer start date based on month name and year.
     * @param monthName : Name of the month for the offer start date.
     * @param yearString : Year for the offer start date.
     * @return : Calculated offer start date as Date.
     */
    private static Date calculateOfferStartDate(String monthName, String yearString) {
        Integer monthNumber;
        switch on monthName {
            when 'January' { monthNumber = 1; }
            when 'February' { monthNumber = 2; }
            when 'March' { monthNumber = 3; }
            when 'April' { monthNumber = 4; }
            when 'May' { monthNumber = 5; }
            when 'June' { monthNumber = 6; }
            when 'July' { monthNumber = 7; }
            when 'August' { monthNumber = 8; }
            when 'September' { monthNumber = 9; }
            when 'October' { monthNumber = 10; }
            when 'November' { monthNumber = 11; }
            when 'December' { monthNumber = 12; }
            when else { monthNumber = null; }
        }

        Integer year = Integer.valueOf(yearString);
        return (monthNumber != null) ? Date.newInstance(year, monthNumber, 1) : null;
    }

    /**
     * @description : Calculate the offer end date based on the start date and course duration.
     * @param startDate : Offer start date.
     * @param duration : Course duration in years.
     * @return : Calculated offer end date as Date.
     */
    private static Date calculateOfferEndDate(Date startDate, Decimal duration) {
        if (duration == null) return null;

        Integer endYear = startDate.year() + (Integer)duration;
        Integer endMonth = startDate.month();
        Integer lastDayOfMonth = Date.daysInMonth(endYear, endMonth);
        return Date.newInstance(endYear, endMonth, lastDayOfMonth);
    }
}