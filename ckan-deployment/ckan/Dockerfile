FROM viderum/ckan:v2.10-dev

ENV CKAN_INI /srv/app/production.ini

# Install S3filestore
RUN pip install -r https://raw.githubusercontent.com/shubham-mahajan/ckanext-s3filestore/v1.0.0-r2/requirements.txt && \
    pip install -e git+https://github.com/shubham-mahajan/ckanext-s3filestore.git@v1.0.0-r2#egg=ckanext-s3filestore

#COPY patches ${APP_DIR}/patches
#RUN for d in $APP_DIR/patches/*; do \
#        if [ -d $d ]; then \
#            for f in `ls $d/*.patch | sort -g`; do \
#                cd $SRC_DIR/`basename "$d"` && echo "$0: Applying patch $f to $SRC_DIR/`basename $d`"; patch -p1 < "$f" ; \
#            done ; \
#        fi ; \
#    done

ENV CKAN__PLUGINS image_view text_view recline_view datastore datapusher envvars

RUN ckan config-tool ${CKAN_INI} "ckan.plugins = ${CKAN__PLUGINS}"


