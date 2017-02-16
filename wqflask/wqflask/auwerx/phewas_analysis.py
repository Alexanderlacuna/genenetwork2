# PheWAS analysis for GN2
# Author / Maintainer: Li Hao & Danny Arends <Danny.Arends@gmail.com>
import sys
from numpy import *
import scipy as sp                            # SciPy
import rpy2.robjects as ro                    # R Objects
import rpy2.rinterface as ri

from base.webqtlConfig import GENERATED_IMAGE_DIR
from utility import webqtlUtil                # Random number for the image
from utility import genofile_parser           # genofile_parser

import base64
import array
import csv
import itertools

from base import data_set
from base import trait as TRAIT

from utility import helper_functions
from utility.tools import locate

r_library       = ro.r["library"]             # Map the library function
r_options       = ro.r["options"]             # Map the options function
r_write_table   = ro.r["write.table"]         # Map the write.table function
r_head          = ro.r["head"]                # Map the head function
r_load          = ro.r["load"]                # Map the head function
r_colnames      = ro.r["colnames"]            # Map the colnames function
r_list          = ro.r["list"]                # Map the list function
r_c             = ro.r["c"]                   # Map the c (combine) function
r_seq           = ro.r["seq"]                 # Map the rep (repeat) function

class PheWAS(object):
    def __init__(self):
        print("Initialization of PheWAS")
        # TODO: Loading the package should only be done once, since it is quite expensive
        print(r_library("auwerx"))                                                         # Load the auwerx package
        self.r_create_Pheno_aligner = ro.r["create.Pheno_aligner"]                         # Map the create.Pheno_aligner function
        self.r_calculate_all_pvalue_parallel = ro.r["calculate.all.pvalue.parallel"]       # Map the calculate.all.pvalue.parallel function
        self.r_PheWASManhattan = ro.r["PheWASManhattan"]                                   # Map the PheWASManhattan function
        self.r_Stop = ro.r["throwStopError"]                                   # Map the PheWASManhattan function
        self.r_PyLoadData    = ro.r["PyLoadData"]          # Map the load function
        print("Initialization of PheWAS done !")

    def run_analysis(self, requestform):
        print("Starting PheWAS analysis on dataset")
        genofilelocation = locate("BXD.geno", "genotype")                                  # Get the location of the BXD genotypes
        precompfilelocation = locate("PheWAS_pval_EMMA_norm.RData", "auwerx")              # Get the location of the pre-computed EMMA results

        parser = genofile_parser.ConvertGenoFile(genofilelocation)
        parser.process_csv()
        snpinfo = []
        for marker in parser.markers:
          snpinfo.append(marker["name"]);
          snpinfo.append(marker["chr"]);
          snpinfo.append(marker["Mb"]);

        rnames = r_seq(1, len(parser.markers))
        # Create the snp aligner object out of the BXD genotypes
        snpaligner = ro.r.matrix(snpinfo, nrow=len(parser.markers), dimnames = r_list(rnames, r_c("SNP", "Chr", "Pos")), ncol = 3, byrow=True)
        #r_write_table(snpaligner, "~/snpaligner_GN2.txt", row_names=False)

        # Create the phenotype aligner object using R
        phenoaligner = self.r_create_Pheno_aligner()

        self.results = {}
        self.results['imgurl1'] = webqtlUtil.genRandStr("phewas_") + ".png"
        self.results['imgloc1'] = GENERATED_IMAGE_DIR + self.results['imgurl1']
        print("IMAGE AT:", self.results['imgurl1'] )
        print("IMAGE AT:", self.results['imgloc1'] )
        # Create the PheWAS plot (The gene/probe name, chromosome and gene/probe positions should come from the user input)
        # TODO: generate the PDF in the temp folder, with a unique name
        phewasres = self.r_PheWASManhattan("Test", precompfilelocation, phenoaligner, snpaligner, "None", 1, 25, 25, self.results['imgloc1'] )
        self.results['phewas1'] = phewasres[0]
        self.results['phewas2'] = phewasres[1]
        self.results['phewas3'] = phewasres[2]

        #self.r_PheWASManhattan(allpvalues)
        #self.r_Stop()

        print("Initialization of PheWAS done !")

    def loadImage(self, path, name):
        print("pre-loading imgage results:", self.results[path])
        imgfile = open(self.results[path], 'rb')
        imgdata = imgfile.read()
        imgB64 = imgdata.encode("base64")
        bytesarray = array.array('B', imgB64)
        self.results[name] = bytesarray

    def render_image(self, results):
        self.loadImage("imgloc1", "imgdata1")

    def process_results(self, results):
        print("Processing PheWAS output")
        # TODO: get the PDF in the temp folder, and display it to the user
        template_vars = {}
        template_vars["results"] = self.results
        self.render_image(self.results)
        return(dict(template_vars))

