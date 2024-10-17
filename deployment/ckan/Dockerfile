FROM viderum/ckan:v2.10.3-alpine-3.18

ENV CKAN_INI /srv/app/production.ini
ENV APP_DIR=/srv/app

USER root
RUN pip3 install --upgrade setuptools==70.0.0
# Install any extensions needed by your CKAN instance
RUN pip3 install -e 'git+https://github.com/datopian/ckanext-scheming.git@ckan-2.10#egg=ckanext-scheming' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-scheming/ckan-2.10/test-requirements.txt' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-s3filestore.git@wri/cost-splitting-orgs#egg=ckanext-s3filestore' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/requirements.txt' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/dev-requirements.txt' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-auth.git@fd7113f076336c13b9952d6b2161c0f4339e5cc6#egg=ckanext-auth' && \
    pip3 install -e 'git+https://github.com/ckan/ckanext-hierarchy.git@master#egg=ckanext-hierarchy' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-issues.git@ckan-2.10#egg=ckanext-issues'

USER root

RUN chmod 777 ${APP_DIR}/src/ckanext-s3filestore

# Required by shapely dependency
RUN apk --update add build-base libxslt-dev python3-dev 

RUN apk add --virtual .build-deps \
        --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing \
        --repository http://dl-cdn.alpinelinux.org/alpine/edge/main \
        gcc libc-dev geos-dev geos && \
    runDeps="$(scanelf --needed --nobanner --recursive /usr/local \
    | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
    | xargs -r apk info --installed \
    | sort -u)" && \
    apk add --virtual .rundeps $runDeps

RUN geos-config --cflags

RUN pip install --disable-pip-version-check Shapely==2.0.1

RUN apk del build-base python3-dev && \
    rm -rf /var/cache/apk/*

RUN apk add proj proj-dev proj-util musl-dev python3-dev
RUN pip3 install pyproj --no-binary pyproj

COPY ckanext-wri ${APP_DIR}/src/ckanext-wri
COPY setup/prerun.py.override ${APP_DIR}/prerun.py
COPY setup/start_ckan.sh.override ${APP_DIR}/start_ckan.sh
RUN chown -R ckan:ckan ${APP_DIR}/src/ckanext-wri
RUN chmod +x ${APP_DIR}/prerun.py
RUN chmod +x ${APP_DIR}/start_ckan.sh

COPY patches ${APP_DIR}/patches
RUN apk --no-cache add patch
RUN for d in $APP_DIR/patches/*; do \
        if [ -d $d ]; then \
            for f in `ls $d/*.patch | sort -g`; do \
                cd $SRC_DIR/`basename "$d"` && echo "$0: Applying patch $f to $SRC_DIR/`basename $d`"; patch -p1 < "$f" ; \
            done ; \
        fi ; \
    done

USER ckan
RUN cd ${APP_DIR}/src/ckanext-wri && pip3 install -r requirements.txt && pip3 install -r dev-requirements.txt && pip3 install -e .

ENV CKAN__PLUGINS image_view text_view webpage_view resource_proxy datatables_view datastore datapusher activity s3filestore scheming_datasets scheming_organizations scheming_groups wri auth hierarchy_display hierarchy_form hierarchy_group_form issues envvars

RUN ckan config-tool ${CKAN_INI} "ckan.plugins = ${CKAN__PLUGINS}"
RUN ckan config-tool ${CKAN_INI} "ckan.auth.create_user_via_web = false"
RUN ckan config-tool ${CKAN_INI} "ckan.root_path = /private-admin/{{LANG}}"

USER ckan

