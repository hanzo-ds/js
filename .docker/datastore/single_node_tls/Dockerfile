FROM ghcr.io/hanzoai/datastore:26.6.1.1
COPY .docker/datastore/single_node_tls/certificates /etc/hanzo-datastore-server/certs
RUN chown hanzo-datastore:hanzo-datastore -R /etc/hanzo-datastore-server/certs \
    && chmod 600 /etc/hanzo-datastore-server/certs/* \
    && chmod 755 /etc/hanzo-datastore-server/certs
