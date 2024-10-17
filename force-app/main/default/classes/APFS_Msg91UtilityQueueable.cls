public class APFS_Msg91UtilityQueueable implements Queueable, Database.AllowsCallouts {
    
    private String mobile;
    private String messageType;
    private Map<String, String> varMap;
    
    public APFS_Msg91UtilityQueueable(String mobile, String messageType, Map<String, String> varMap) {
        this.mobile = mobile;
        this.messageType = messageType;
        this.varMap = varMap;
    }

    public void execute(QueueableContext context) {
        String endpoint = 'callout:MSG91Authentication/api/v5/flow';
        
        try {
            // Ensure the mobile number includes the country code
            if (!mobile.startsWith('91')) {
                mobile = '91' + mobile;
            }
            
            // Retrieve the template ID based on the message type
            String templateId = getTemplateIdByMessageType(messageType);
            if (String.isEmpty(templateId)) {
                throw new APFS_CustomException('Template ID not found for message type: ' + messageType);
            }
            
            // Construct the JSON payload dynamically
            String payload = '{"template_id": "' + templateId + '", "short_url": "0", "realTimeResponse": "1", "recipients": [{"mobiles": "' + mobile + '"';
            
            // Add dynamic variables to the payload
            for (String key : varMap.keySet()) {
                payload += ', "' + key + '": "' + varMap.get(key) + '"';
            }
            
            payload += '}]}';
            System.debug(payload);
            
            // Create the HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setMethod('POST');
            req.setHeader('accept', 'application/json');
            req.setHeader('content-type', 'application/json');
            req.setBody(payload);
            
            // Send the HTTP request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Check the response status
            if (res.getStatusCode() == 200) {
                System.debug('SMS sent successfully.');
            } else {
                System.debug('Failed to send SMS. Status: ' + res.getStatus() + ' Response: ' + res.getBody());
                throw new APFS_CustomException('Failed to send SMS: ' + res.getBody());
            }
            
        } catch(Exception e) {
            throw new APFS_CustomException(e.getMessage());
        }
    }
    
    private static String getTemplateIdByMessageType(String messageType) {
        List<SMS_Template__mdt> templates = [
            SELECT Template_ID__c 
            FROM SMS_Template__mdt 
            WHERE Message_Type__c = :messageType 
            LIMIT 1
        ];
        
        if (!templates.isEmpty()) {
            return templates[0].Template_ID__c;
        } else {
            return null;
        }
    }
}