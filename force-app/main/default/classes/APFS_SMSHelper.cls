/**
 * @description       : Utility class for managing SMS messages in the APFS system.
 *                      This class defines a structure for creating and storing SMS message details such as the mobile number,
 *                      message type, and dynamic variables for use in the SMS content.
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 07-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * 
 * @class             : APFS_SMSHelper
 */
public without sharing class APFS_SMSHelper {

    /**
     * @description       : This inner class represents an SMS message.
     *                      It contains the mobile number to send the message to, the message type (template), and dynamic variables 
     *                      to be used within the message.
     * 
     * @innerClass        : SMSMessage
     */
    public class SMSMessage {
        public String mobile;         // The mobile number to which the SMS will be sent
        public String messageType;    // The type of the SMS message or the template to be used
        public Map<String, String> varMap; // The dynamic variables to be used in the SMS content

        /**
         * @description       : Constructor for creating an SMS message with mobile number, message type, and variables.
         * 
         * @param mobile      : The mobile number to which the SMS will be sent.
         * @param messageType : The template type for the SMS message.
         * @param varMap      : A map of dynamic variables to be used in the message content.
         */
        public SMSMessage(String mobile, String messageType, Map<String, String> varMap) {
            this.mobile = mobile;
            this.messageType = messageType;
            this.varMap = varMap;
        }
    }
}