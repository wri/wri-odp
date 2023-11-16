FROM viderum/ckan:v2.10-dev-security-fix

ENV CKAN_INI /srv/app/production.ini
ENV APP_DIR=/srv/app

# Install any extensions needed by your CKAN instance
RUN pip3 install -e 'git+https://github.com/datopian/ckanext-scheming.git@ckan-2.10#egg=ckanext-scheming' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-scheming/ckan-2.10/test-requirements.txt' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-s3filestore.git@wri/cost-splitting-orgs#egg=ckanext-s3filestore' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/requirements.txt' && \
    pip3 install -r 'https://raw.githubusercontent.com/datopian/ckanext-s3filestore/wri/cost-splitting-orgs/dev-requirements.txt' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-auth.git@auth-object-return-token#egg=ckanext-auth' && \
    pip3 install -e 'git+https://github.com/ckan/ckanext-hierarchy.git@master#egg=ckanext-hierarchy' && \
    pip3 install -e 'git+https://github.com/datopian/ckanext-issues.git@ckan-2.10#egg=ckanext-issues'


USER root

COPY ckanext-wri ${APP_DIR}/src/ckanext-wri
COPY setup/prerun.py.override ${APP_DIR}/prerun.py
RUN chown -R ckan:ckan ${APP_DIR}/src/ckanext-wri
RUN chmod +x ${APP_DIR}/prerun.py

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

USER ckan
