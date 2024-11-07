/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package chatgpt_java_code;


import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import org.codehaus.jettison.json.JSONObject;


/**
 *
 * @author mountant
 */
public class ChatGPT {
    
    public String key=""; // PUT YOUR KEY
    
    
    
    public String getChatGPTResponse(String text,String model) throws Exception{
        if(model.equals("davinci")){
            return chatGPT(text);
        }
        else if(model.equals("turbo")){
            return chatGPT_TURBO(text);
        }
        
        
        return "";
    }
    

      public  String chatGPT_TURBO(String text) throws Exception {
         String url = "https://api.openai.com/v1/chat/completions";
         HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();

         con.setRequestMethod("POST");
         con.setRequestProperty("Content-Type", "application/json");
         con.setRequestProperty("Authorization", "Bearer "+key);


         JSONObject data = new JSONObject();
         data.put("model", "gpt-3.5-turbo");
         data.put("messages", "[{'role': 'user', 'content': 'MyText'}]");
         data.put("temperature", 1.0);
         data.put("max_tokens", 1000);
        
         String body=data.toString().replace("\"[", "[").replace("]\"", "]").replace("'","\"").replace("MyText", text);
          System.out.println(body);
         con.setDoOutput(true);
         con.getOutputStream().write(body.toString().getBytes());

         String output = new BufferedReader(new InputStreamReader(con.getInputStream())).lines()
                 .reduce((a, b) -> a + b).get();

         return new JSONObject(output).getJSONArray("choices").getJSONObject(0).getJSONObject("message").getString("content");
     }
    
      public  String chatGPT(String text) throws Exception {
         String url = "https://api.openai.com/v1/completions";
         HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();

         con.setRequestMethod("POST");
         con.setRequestProperty("Content-Type", "application/json");
         con.setRequestProperty("Authorization", "Bearer "+key);
              

         JSONObject data = new JSONObject();
         data.put("model", "text-davinci-003");
         data.put("prompt", text);
         data.put("max_tokens", 4000);

         data.put("temperature", 1.0);

         con.setDoOutput(true);
         con.getOutputStream().write(data.toString().getBytes());

         String output = new BufferedReader(new InputStreamReader(con.getInputStream())).lines()
                 .reduce((a, b) -> a + b).get();

         return new JSONObject(output).getJSONArray("choices").getJSONObject(0).getString("text");
     }


     public static void startDialogue() throws Exception {
         Scanner myObj = new Scanner(System.in);  // Create a Scanner object
         String userQ;
         System.out.print("- ");
         ChatGPT chat=new ChatGPT();
         while(1==1) {
             userQ = myObj.nextLine();  // Read user input
             //System.out.println("Username is: " + userQ);  // Output user input
             System.out.print("- ");
             chat.chatGPT(userQ);
             System.out.print("- ");
          }

     }

    
}
