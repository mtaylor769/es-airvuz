FROM docker.elastic.co/elasticsearch/elasticsearch:5.1.1
ADD elasticsearch.yml /usr/share/elasticsearch/config/
USER root
chown 1000:1000 config/elasticsearch.yml
USER elasticsearch

