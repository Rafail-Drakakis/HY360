/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.mycompany.spark_laptops;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.HashMap;
import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.put;

/**
 *
 * @author mountant
 */
public class LaptopsRESTAPI {

    static HashMap<String, Laptop> laptops = new HashMap<>();
    static String apiPath = "computersAPI/eshop/";

    public static void main(String[] args) {

        if (laptops.isEmpty()) {
            Laptop p = new Laptop("Toshiba", "Toshiba_Satellite", "i5", "8GB", 15);
            Laptop p1 = new Laptop("Toshiba", "Toshiba_satellite_PRO", "i7", "16GB", 15);
            Laptop p2 = new Laptop("Dell", "Dell_A", "i7", "8GB", 150);

            laptops.put(p.name, p);
            laptops.put(p1.name, p1);
            laptops.put(p2.name, p2);
        }

        get(apiPath + "/laptops", (request, response) -> {
            response.status(200);
            response.type("application/json");
            return new Gson().toJson(new StandardResponse(new Gson().toJsonTree(laptops)));
        });

        get(apiPath + "/laptops/:brand", (request, response) -> {
            response.type("application/json");
            ArrayList<Laptop> laptopsWithBrand = new ArrayList<Laptop>();

            for (Laptop l : laptops.values()) {
                if (l.brand.equals(request.params(":brand"))) {
                    laptopsWithBrand.add(l);
                }
            }
            if (!laptopsWithBrand.isEmpty()) {
                response.status(200);
                String json = new Gson().toJson(laptopsWithBrand);
                return new Gson().toJson(new StandardResponse(new Gson().toJsonTree(laptopsWithBrand)));
            } else {
                response.status(404);
                return new Gson().toJson(new StandardResponse(new Gson()
                        .toJson("Error: Laptop Brand not exists")));
            }
        });

        get(apiPath + "/laptopsWithSpecs/:memory", (request, response) -> {
            response.type("application/json");
            ArrayList<Laptop> laptopsWithMemory = new ArrayList<Laptop>();
            String memory = request.params(":memory");
            String core = request.queryParams("core");
            for (Laptop l : laptops.values()) {
                if (l.memory.equals(memory) && (core == null || l.core.equals(core))) {
                    laptopsWithMemory.add(l);
                }
            }
            if (!laptopsWithMemory.isEmpty()) {
                String json = new Gson().toJson(laptopsWithMemory);
                response.status(200);
                return new Gson().toJson(new StandardResponse(new Gson().toJsonTree(laptopsWithMemory)));
            } else {
                response.status(404);
                return new Gson().toJson(new StandardResponse(new Gson()
                        .toJson("Error: Laptop Not Found")));
            }

        });

        post(apiPath + "/newLaptop", (request, response) -> {
            response.type("application/json");
            Laptop lap = new Gson().fromJson(request.body(), Laptop.class);
            if (laptops.containsKey(lap.name)) {
                response.status(400);
                return new Gson().toJson(new StandardResponse(new Gson()
                        .toJson("Error: Laptop Exists")));

            } else {
                laptops.put(lap.name, lap);
                response.status(200);
                return new Gson().toJson(new StandardResponse(new Gson()
                        .toJson("Success: Laptop Added")));
            }
        });

        put(apiPath + "/laptopQuantity/:name/:quantity", (request, response) -> {
            response.type("application/json");
            if (laptops.containsKey(request.params(":name")) == false) {
                response.status(404);
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Laptop  not found")));
            } else if (Integer.parseInt(request.params(":quantity")) <= 0) {
                response.status(406);
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Quantity must be over 0")));
            } else {
                Laptop p = laptops.get(request.params(":name"));
                p.quantity += Integer.parseInt(request.params(":quantity"));
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Success: Quantity Updated")));
            }
        });

        delete(apiPath + "/laptop/:name", (request, response) -> {
            response.type("application/json");
            if (laptops.containsKey(request.params(":name"))) {
                laptops.remove(request.params(":name"));
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Laptop Deleted")));
            } else {
                response.status(404);
                return new Gson().toJson(new StandardResponse(new Gson().toJson("Error: Laptop  not found")));
            }
        });
    }

}
