package com.usiu.campusevents;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class CampusEventManagementApplicationTests {

    @Test
    void applicationEntryPointIsAvailable() {
        assertDoesNotThrow(() -> Class.forName("com.usiu.campusevents.CampusEventManagementApplication"));
    }
}
