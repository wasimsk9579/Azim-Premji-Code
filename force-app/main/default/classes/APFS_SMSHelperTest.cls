@isTest
private class APFS_SMSHelperTest {

    @isTest
    static void testSMSMessageCreation() {
        
        String mobileNumber = '1234567890';
        String messageType = 'Message';
        Map<String, String> variables = new Map<String, String>{
            'userName' => 'Azim Premji',
            'expiryDate' => '2024-12-31'
        };

        
        APFS_SMSHelper.SMSMessage smsMessage = new APFS_SMSHelper.SMSMessage(mobileNumber, messageType, variables);

        
        System.assertEquals(mobileNumber, smsMessage.mobile, 'Mobile number should match.');
        System.assertEquals(messageType, smsMessage.messageType, 'Message type should match.');
        System.assertEquals(variables, smsMessage.varMap, 'Variable map should match.');
    }

    @isTest
    static void testSMSMessageWithEmptyVariables() {
        
        String mobileNumber = '0987654321';
        String messageType = 'FarewellMessage';
        Map<String, String> variables = new Map<String, String>();

        
        APFS_SMSHelper.SMSMessage smsMessage = new APFS_SMSHelper.SMSMessage(mobileNumber, messageType, variables);

        
        System.assertEquals(mobileNumber, smsMessage.mobile, 'Mobile number should match.');
        System.assertEquals(messageType, smsMessage.messageType, 'Message type should match.');
        System.assertEquals(variables, smsMessage.varMap, 'Variable map should match.');
    }
}