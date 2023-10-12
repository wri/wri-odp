FROM viderum/ckan:v2.10-dev

ENV CKAN_INI /srv/app/production.ini

# Install any extensions needed by your CKAN instance
RUN pip3 install -e 'git+https://github.com/datopian/ckanext-scheming.git@ckan-2.10#egg=ckanext-scheming' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-scheming/ckan-2.10/test-requirements.txt' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-s3filestore.git@wri/cost-splitting-orgs#egg=ckanext-s3filestore' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/requirements.txt' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/dev-requirements.txt'

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

COPY setup/prerun.py.override ${APP_DIR}/prerun.py
USER root
RUN chmod +x ${APP_DIR}/prerun.py
USER ckan
