package com.energiadc.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiProblem.class)
    public ResponseEntity<Map<String, String>> apiProblem(ApiProblem ex) {
        return ResponseEntity.status(ex.status).body(Map.of("detail", ex.getMessage()));
    }
    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, String>> invalidParameter(Exception ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("detail", "Parâmetros inválidos. Informe start e end em ISO 8601 com fuso horário."));
    }
    public static class ApiProblem extends RuntimeException {
        private final HttpStatus status;
        public ApiProblem(HttpStatus status, String message) { super(message); this.status = status; }
    }
}
