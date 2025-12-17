import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import TrueEval.TrueEval;

public final class TrueEvaluator {
    
    public static void main(final String[] args) {
        if (args.length != 2) {
            System.out.println("TrueEvaluator usage:");
            System.out.println("1. Argument is a json file name containing evaluation instructions");
            System.out.println("2. Argument is an output json file name containing results");
            System.exit(0);
        }
        
	     try {
	    	String json = new String(Files.readAllBytes(Paths.get(args[0])));
	    	TrueEval eval = new TrueEval();
	    	String out = eval.Execute(json);
	    	Files.write(Paths.get(args[1]), out.getBytes());
		} catch (IOException e) {
			e.printStackTrace();
		}

    }
}
