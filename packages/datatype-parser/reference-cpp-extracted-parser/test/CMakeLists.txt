# The oracle test needs a Datastore binary to produce expected output.
# Override with -DDATASTORE_BINARY=/path/to/datastore at configure time.
set(DATASTORE_BINARY "${CMAKE_SOURCE_DIR}/../build/programs/datastore"
    CACHE FILEPATH "Path to the datastore binary used as the oracle")

find_package(Python3 COMPONENTS Interpreter)

if(Python3_Interpreter_FOUND)
    add_test(
        NAME oracle
        COMMAND ${Python3_EXECUTABLE}
            ${CMAKE_CURRENT_SOURCE_DIR}/oracle_compare.py
            --datastore ${DATASTORE_BINARY}
            --tool $<TARGET_FILE:chdt-parse>
            --cases ${CMAKE_CURRENT_SOURCE_DIR}/cases.txt
    )
    add_test(
        NAME unsupported
        COMMAND ${Python3_EXECUTABLE}
            ${CMAKE_CURRENT_SOURCE_DIR}/check_unsupported.py
            --tool $<TARGET_FILE:chdt-parse>
            --cases ${CMAKE_CURRENT_SOURCE_DIR}/cases_unsupported.txt
    )
endif()
