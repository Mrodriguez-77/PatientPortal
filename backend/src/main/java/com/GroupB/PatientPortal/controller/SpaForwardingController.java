package com.GroupB.PatientPortal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    // Forward non-API routes to the SPA entry point.
    @RequestMapping({
            "/",
            "/{path:^(?!api|ws|swagger-ui|api-docs|assets|favicon\\.svg|index\\.html).*$}",
            "/{path:^(?!api|ws|swagger-ui|api-docs|assets|favicon\\.svg|index\\.html).*$}/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
