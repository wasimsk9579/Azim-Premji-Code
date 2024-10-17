/**
 * @description       : Utility class for sending SMS using Queueable Apex. Supports both individual and bulk SMS operations.
 *                      Handles both single and bulk callouts, and ensures transaction limits are respected.
 * @implements        : Queueable, Database.AllowsCallouts
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 29-09-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 */
public without sharing class APFS_Msg91UtilityController implements Queueable, Database.AllowsCallouts {

    private List<APFS_SMSHelper.SMSMessage> smsMessages;

    // Constructor for individual SMS
    public APFS_Msg91UtilityController(String mobile, String messageType, Map<String, String> varMap) {
        this.smsMessages = new List<APFS_SMSHelper.SMSMessage>();
        this.smsMessages.add(new APFS_SMSHelper.SMSMessage(mobile, messageType, varMap));
        System.debug('APFS_Msg91UtilityController - Initialized for individual SMS');
    }

    // Constructor for bulk SMS
    public APFS_Msg91UtilityController(List<APFS_SMSHelper.SMSMessage> smsMessages) {
        this.smsMessages = smsMessages;
        System.debug('APFS_Msg91UtilityController - Initialized for bulk SMS');
    }

    /**
     * @description       : Executes the Queueable job for sending SMS using the MSG91 API.
     * @param context     : QueueableContext provided by Salesforce
     */
    public void execute(QueueableContext context) {
        System.debug('APFS_Msg91UtilityController.execute - Started execution of Queueable for SMS messages');
        
        try {
            for (APFS_SMSHelper.SMSMessage sms : smsMessages) {
                System.debug('Processing SMS for mobile: ' + sms.mobile + ', message type: ' + sms.messageType);

                String templateId = getTemplateIdByMessageType(sms.messageType);
                if (String.isEmpty(templateId)) {throw new APFS_CustomException('Template ID not found for message type: ' + sms.messageType);
                }
                System.debug('Template ID found: ' + templateId + ' for message type: ' + sms.messageType);

                // Ensure the mobile number has the country code '91'
                String mobile = sms.mobile.startsWith('91') ? sms.mobile : '91' + sms.mobile;
                System.debug('Mobile number processed with country code: ' + mobile);

                // Send the SMS
                sendSmsRequest(mobile, templateId, sms.varMap);
            }
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_Msg91UtilityController', 'execute', e.getMessage(), UserInfo.getUserId());
            System.debug('APFS_Msg91UtilityController.execute - Exception: ' + e.getMessage());
           throw new APFS_CustomException('Failed to send SMS: ' + e.getMessage()); 
        }
        
        System.debug('APFS_Msg91UtilityController.execute - Finished execution of Queueable for SMS messages');
    }

    /**
     * @description       : Retrieves the template ID from custom metadata based on the message type.
     * @param messageType : The type of SMS message template
     * @return            : Template ID as a string
     * @throws            : APFS_CustomException if no template is found
     */
    private static String getTemplateIdByMessageType(String messageType) {
        System.debug('APFS_Msg91UtilityController.getTemplateIdByMessageType - Fetching template ID for message type: ' + messageType);
        
        try {
            List<SMS_Template__mdt> templates = [ SELECT Template_ID__c FROM SMS_Template__mdt
                WHERE Message_Type__c = :messageType LIMIT 1 ];
            if (!templates.isEmpty()) {
                System.debug('Template ID found: ' + templates[0].Template_ID__c);
                return templates[0].Template_ID__c;
            } else {throw new APFS_CustomException('Template not found for message type: ' + messageType);
            }  
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_Msg91UtilityController', 'getTemplateIdByMessageType', e.getMessage(), UserInfo.getUserId());

            System.debug('APFS_Msg91UtilityController.getTemplateIdByMessageType - Exception: ' + e.getMessage());
            throw new APFS_CustomException('Failed to retrieve template ID: ' + e.getMessage());
        }
    }

    /**
     * @description       : Sends the SMS using the MSG91 API with the provided payload.
     * @param mobile      : Mobile number to send SMS to
     * @param templateId  : Template ID to use for SMS
     * @param varMap      : Dynamic variables to include in the SMS content
     */
    private static void sendSmsRequest(String mobile, String templateId, Map<String, String> varMap) {
        System.debug('APFS_Msg91UtilityController.sendSmsRequest - Sending SMS to mobile: ' + mobile + ' with template ID: ' + templateId);

        String endpoint = 'callout:MSG91Authentication/api/v5/flow';
        String payload = '{"template_id": "' + templateId + '", "short_url": "0", "realTimeResponse": "1", "recipients": [{"mobiles": "' + mobile + '"';

        // Append dynamic variables to the payload
        for (String key : varMap.keySet()) {
            payload += ', "' + key + '": "' + varMap.get(key) + '"';
        }
        payload += '}]}' ;

        try {
            // Create HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setMethod('POST');
            req.setHeader('accept', 'application/json');
            req.setHeader('content-type', 'application/json');
            req.setBody(payload);

            // Send HTTP request
            Http http = new Http();
            HttpResponse res = http.send(req);

            // Handle the response
            if (res.getStatusCode() != 200) {
                System.debug('APFS_Msg91UtilityController.sendSmsRequest - Failed SMS response: ' + res.getBody());
                throw new APFS_CustomException('Failed to send SMS. Status: ' + res.getStatus() + ', Response: ' + res.getBody());
            }

            System.debug('APFS_Msg91UtilityController.sendSmsRequest - SMS sent successfully. Response: ' + res.getBody());
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_Msg91UtilityController', 'sendSmsRequest', e.getMessage(), UserInfo.getUserId());
            System.debug('APFS_Msg91UtilityController.sendSmsRequest - Exception: ' + e.getMessage());
            throw new APFS_CustomException('Failed to send SMS: ' + e.getMessage());
        }
    }

    /**
     * @description       : Public static method to enqueue a single SMS.
     * @param mobile      : Mobile number to send SMS
     * @param messageType : Template type for SMS
     * @param varMap      : Dynamic variables to include in the SMS content
     */
    public static void sendSms(String mobile, String messageType, Map<String, String> varMap) {
        System.debug('APFS_Msg91UtilityController.sendSms - Enqueuing single SMS for mobile: ' + mobile + ', message type: ' + messageType);

        try {
            System.enqueueJob(new APFS_Msg91UtilityController(mobile, messageType, varMap));
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_Msg91UtilityController', 'sendSms', e.getMessage(), UserInfo.getUserId());
            System.debug('APFS_Msg91UtilityController.sendSms - Exception: ' + e.getMessage());
            throw new APFS_CustomException('Failed to enqueue SMS sending job: ' + e.getMessage());
        }
    }

    /**
     * @description       : Public static method to enqueue bulk SMS.
     * @param smsMessages : List of SMS messages to send
     */
    public static void sendBulkSms(List<APFS_SMSHelper.SMSMessage> smsMessages) {
        System.debug('APFS_Msg91UtilityController.sendBulkSms - Enqueuing bulk SMS for ' + smsMessages.size() + ' messages');

        try {
            System.enqueueJob(new APFS_Msg91UtilityController(smsMessages));
        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_Msg91UtilityController', 'sendBulkSms', e.getMessage(), UserInfo.getUserId());
            System.debug('APFS_Msg91UtilityController.sendBulkSms - Exception: ' + e.getMessage());
            throw new APFS_CustomException('Failed to enqueue bulk SMS job: ' + e.getMessage());
        }
    }
}