/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package chatgpt_java_code;

/**
 *
 * @author mountant
 */
public class ChatGPT_Java_Code {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws Exception {
        ChatGPT chatgpt = new ChatGPT();
        String text = "Which is the birth place of Lakis Lazopoulos";
        String model = "turbo";
        String response = chatgpt.getChatGPTResponse(text, model);
        System.out.println(response);
    }

}
